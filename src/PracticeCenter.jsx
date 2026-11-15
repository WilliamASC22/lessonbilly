
import { useEffect, useRef, useState } from "react";
import {
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  FileUp,
  Layers,
  Plus,
  Send,
  Sparkles
} from "lucide-react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where
} from "firebase/firestore";
import { db } from "./firebase";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

const MODEL = "SmolLM2-360M-Instruct-q4f32_1-MLC";
const emptyCard = () => ({ front: "", back: "" });
const emptyQuiz = () => ({
  prompt: "",
  options: ["", "", "", ""],
  answerIndex: null,
  explanation: ""
});
const tenCards = () => Array.from({ length: 10 }, emptyCard);
const tenQuizzes = () => Array.from({ length: 10 }, emptyQuiz);
const trim = value => String(value || "").trim();

const classList = student =>
  Array.isArray(student?.classes) && student.classes.length
    ? student.classes
    : [
        {
          id: "original",
          name: student?.subject || "General tutoring"
        }
      ];

function parseFlashcards(text) {
  return text
    .split(/\r?\n/)
    .map(line =>
      line.replace(/^\s*\d+[.)]\s*/, "").trim()
    )
    .filter(line => /^CARD\s*\|/i.test(line))
    .map(line => {
      const parts = line.split("|").map(trim);

      return {
        front: parts[1] || "",
        back: parts.slice(2).join(" | ") || ""
      };
    })
    .filter(card => card.front && card.back)
    .slice(0, 10);
}

function parseQuizzes(text) {
  return text
    .split(/\r?\n/)
    .map(line =>
      line.replace(/^\s*\d+[.)]\s*/, "").trim()
    )
    .filter(line => /^QUIZ\s*\|/i.test(line))
    .map(line => {
      const parts = line.split("|").map(trim);
      const answer = Number(parts[6]);

      return {
        prompt: parts[1] || "",
        options: [
          parts[2] || "",
          parts[3] || "",
          parts[4] || "",
          parts[5] || ""
        ],
        answerIndex: [1, 2, 3, 4].includes(answer)
          ? answer - 1
          : null,
        explanation: parts.slice(7).join(" | ") || ""
      };
    })
    .filter(q => q.prompt && q.options.every(Boolean))
    .slice(0, 10);
}


async function readPdf(file) {
  if (!file) {
    throw new Error("Please choose a PDF file.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error(
      "Use a PDF no larger than 5 MB."
    );
  }

  if (
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    throw new Error(
      "Only PDF files are supported."
    );
  }

  const pdfjs = await import("pdfjs-dist");

  pdfjs.GlobalWorkerOptions.workerSrc =
    pdfWorkerUrl;

  const fileBytes = new Uint8Array(
    await file.arrayBuffer()
  );

  const loadingTask = pdfjs.getDocument({
    data: fileBytes
  });

  let extractedText = "";

  try {
    const pdf = await loadingTask.promise;

    const pagesToRead = Math.min(
      pdf.numPages,
      12
    );

    for (
      let pageNumber = 1;
      pageNumber <= pagesToRead;
      pageNumber++
    ) {
      const page = await pdf.getPage(
        pageNumber
      );

      const content =
        await page.getTextContent();

      const pageText = content.items
        .map(item => item.str || "")
        .join(" ");

      extractedText +=
        pageText + "\n\n";

      if (extractedText.length > 11000) {
        break;
      }
    }
  } finally {
    // PDF cleanup must not cause an otherwise
    // successful upload to fail.
    try {
      if (
        typeof loadingTask.destroy ===
        "function"
      ) {
        await loadingTask.destroy();
      }
    } catch (cleanupError) {
      console.warn(
        "PDF cleanup warning:",
        cleanupError
      );
    }
  }

  const finalText = extractedText
    .trim()
    .slice(0, 11000);

  if (!finalText) {
    throw new Error(
      "No readable text was found in this PDF. " +
      "Use a text-based PDF or paste lesson notes."
    );
  }

  return finalText;
}

export default function PracticeCenter({
  user,
  isTutor,
  role
}) {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [classId, setClassId] = useState("");
  const [notes, setNotes] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [cards, setCards] = useState(tenCards);
  const [questions, setQuestions] = useState(tenQuizzes);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modelState, setModelState] = useState("idle");
  const [progress, setProgress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState("flashcards");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});

  const engine = useRef(null);

  useEffect(() => {
    const studentQuery = isTutor
      ? collection(db, "students")
      : query(
          collection(db, "students"),
          where(
            role === "student"
              ? "studentUids"
              : "parentUids",
            "array-contains",
            user.uid
          )
        );

    return onSnapshot(
      studentQuery,
      snap => {
        setStudents(
          snap.docs.map(d => ({
            id: d.id,
            ...d.data()
          }))
        );

        setLoading(false);
      },
      e => {
        setError(e.message);
        setLoading(false);
      }
    );
  }, [user.uid, isTutor, role]);

  useEffect(() => {
    if (!students.some(s => s.id === studentId)) {
      setStudentId(students[0]?.id || "");
    }
  }, [students, studentId]);

  const student = students.find(
    s => s.id === studentId
  );

  const classes = classList(student);

  const selectedClass =
    classes.find(c => c.id === classId) || classes[0];

  useEffect(() => {
    if (!studentId || !selectedClass?.id) return;

    let alive = true;

    setLoading(true);
    setError("");
    setNotice("");
    setPublished(false);

    setCards(tenCards());
    setQuestions(tenQuizzes());
    setNotes("");
    setPdfName("");

    setTab("flashcards");
    setCardIndex(0);
    setQuizIndex(0);
    setFlipped(false);
    setAnswers({});
    setChecked({});

    getDoc(
      doc(
        db,
        "students",
        studentId,
        "practice",
        selectedClass.id
      )
    )
      .then(snap => {
        if (!alive) return;

        if (snap.exists() && snap.data().published) {
          const data = snap.data();

          setCards(data.flashcards || tenCards());
          setQuestions(data.questions || tenQuizzes());
          setPublished(true);
        }
      })
      .catch(e => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [studentId, selectedClass?.id]);

  useEffect(
    () => () => {
      try {
        engine.current?.unload?.();
      } catch {
        // Unloading the model is optional.
      }
    },
    []
  );

  function resetPractice() {
    setCardIndex(0);
    setQuizIndex(0);
    setFlipped(false);
    setAnswers({});
    setChecked({});
  }

  function updateCard(index, key, value) {
    setCards(old =>
      old.map((card, i) =>
        i === index ? { ...card, [key]: value } : card
      )
    );
  }

  function updateQuiz(index, key, value) {
    setQuestions(old =>
      old.map((q, i) =>
        i === index ? { ...q, [key]: value } : q
      )
    );
  }

  function updateChoice(index, choice, value) {
    setQuestions(old =>
      old.map((q, i) =>
        i === index
          ? {
              ...q,
              options: q.options.map((o, j) =>
                j === choice ? value : o
              )
            }
          : q
      )
    );
  }

  async function handlePdf(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setError("");
    setNotice("");

    try {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        throw new Error("Choose a PDF file.");
      }

      setNotes(await readPdf(file));
      setPdfName(file.name);

      setNotice(
        "Extracted text from the PDF. Review it before generating activities."
      );
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadModel() {
    if (engine.current) return engine.current;

    if (!navigator.gpu) {
      throw new Error(
        "AI generation needs a WebGPU-compatible browser and device. You can still write activities manually."
      );
    }

    setModelState("loading");

    const webllm = await import("@mlc-ai/web-llm");

    const instance = await webllm.CreateMLCEngine(
      MODEL,
      {
        initProgressCallback: info =>
          setProgress(
            info.text || "Preparing on-device AI..."
          )
      }
    );

    engine.current = instance;
    setModelState("ready");

    return instance;
  }

  async function generate() {
    if (!notes.trim()) {
      setError(
        "Paste lesson notes or upload a text-based PDF first."
      );
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const llm = await loadModel();
      const lesson = notes.slice(0, 5200);

      const cardResponse =
        await llm.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "Produce 10 flashcards strictly grounded in the user's lesson material. Output exactly 10 lines in the format CARD|question|answer. No commentary, markdown or invented facts."
            },
            {
              role: "user",
              content:
                `Create ${student?.gradeLevel || "school-level"} flashcards for ${selectedClass.name} from these notes only:\n${lesson}`
            }
          ],
          temperature: 0.2,
          max_tokens: 1150
        });

      const quizResponse =
        await llm.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "Produce 10 multiple-choice questions strictly based on the supplied notes. Format EACH line as QUIZ|question|choice A|choice B|choice C|choice D|correct choice number 1-4|short explanation. Use no markdown or extra text. Provide exactly 10 lines. Each question must have one unambiguously correct answer."
            },
            {
              role: "user",
              content:
                `Write ${student?.gradeLevel || "school-level"} quiz questions for ${selectedClass.name} from these notes only:\n${lesson}`
            }
          ],
          temperature: 0.2,
          max_tokens: 1700
        });

      const parsedCards = parseFlashcards(
        String(
          cardResponse.choices?.[0]?.message?.content || ""
        )
      );

      const parsedQuizzes = parseQuizzes(
        String(
          quizResponse.choices?.[0]?.message?.content || ""
        )
      );

      setCards(
        [...parsedCards, ...tenCards()].slice(0, 10)
      );

      setQuestions(
        [...parsedQuizzes, ...tenQuizzes()].slice(0, 10)
      );

      setPublished(false);

      setNotice(
        `AI drafted ${parsedCards.length}/10 flashcards and ${parsedQuizzes.length}/10 quiz questions. Check every fact and answer key, then complete or correct the blanks before publishing. Drafts are not saved until you publish.`
      );
    } catch (e) {
      setModelState("unavailable");
      setError(
        `AI generation unavailable: ${e.message}. You can use blank drafts instead.`
      );
    } finally {
      setBusy(false);
    }
  }

  async function publish(event) {
    event.preventDefault();

    if (!studentId || !selectedClass) return;

    if (
      cards.length !== 10 ||
      questions.length !== 10 ||
      cards.some(
        c => !trim(c.front) || !trim(c.back)
      ) ||
      questions.some(
        q =>
          !trim(q.prompt) ||
          q.options?.length !== 4 ||
          q.options.some(a => !trim(a)) ||
          !Number.isInteger(q.answerIndex) ||
          q.answerIndex < 0 ||
          q.answerIndex > 3
      )
    ) {
      setError(
        "Complete all 10 flashcards and 10 quiz questions, including four answers and a correct-answer selection for each quiz question."
      );
      return;
    }

    if (
      !window.confirm(
        `Publish these 20 tutor-approved activities for ${student.name} - ${selectedClass.name}? Students will see them immediately.`
      )
    ) {
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await setDoc(
        doc(
          db,
          "students",
          studentId,
          "practice",
          selectedClass.id
        ),
        {
          published: true,
          classId: selectedClass.id,

          flashcards: cards.map(c => ({
            front: trim(c.front).slice(0, 500),
            back: trim(c.back).slice(0, 700)
          })),

          questions: questions.map(q => ({
            prompt: trim(q.prompt).slice(0, 500),
            options: q.options.map(x =>
              trim(x).slice(0, 250)
            ),
            answerIndex: q.answerIndex,
            explanation: trim(q.explanation).slice(
              0,
              600
            )
          })),

          updatedAt: serverTimestamp()
        }
      );

      setPublished(true);
      resetPractice();

      setNotice(
        "Published! Students and linked parents can open the new activities in Practice Center."
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const quiz = questions[quizIndex];

  const answeredCount = Object.keys(checked).length;

  const correctCount = Object.entries(checked).filter(
    ([index]) =>
      answers[index] ===
      questions[Number(index)]?.answerIndex
  ).length;

  return (
    <section className="dashboard-page shell lb-practice-page">
      <div className="dashboard-heading">
        <div>
          <span className="section-kicker">
            LEARN BETWEEN LESSONS
          </span>

          <h1>
            <BookOpenCheck
              size={30}
              style={{ verticalAlign: "middle" }}
            />
            Practice Center
          </h1>

          <p>
            {isTutor
              ? "Generate, review and publish exercises for a specific class."
              : "Practice with activities approved by your tutor. Your answers disappear when you reload."}
          </p>
        </div>

        <span className="secure-chip">
          <CheckCircle2 size={17} />
          {isTutor
            ? "Tutor review required"
            : "Practice isn't graded"}
        </span>
      </div>

      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}

      {notice && (
        <div className="success-note" role="status">
          {notice}
        </div>
      )}

      <div className="panel lb-practice-select">
        <label>
          Student
          <select
            value={studentId}
            onChange={e => {
              setStudentId(e.target.value);
              setClassId("");
            }}
          >
            <option value="">Choose a student</option>

            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Class
          <select
            value={selectedClass?.id || ""}
            onChange={e => setClassId(e.target.value)}
            disabled={!student}
          >
            <option value="">Choose a class</option>

            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && (
        <p className="muted">
          Loading practice activities...
        </p>
      )}

      {!loading && !students.length && (
        <div className="panel empty-small">
          {isTutor
            ? "Add a student from Dashboard first."
            : "Ask your tutor to link your account to a student record."}
        </div>
      )}

      {!student || !selectedClass ? null : isTutor ? (
        <>
          <div className="panel">
            <h2>Step 1 - Provide lesson material</h2>

            <p className="muted tiny">
              Use a text-based PDF from your device
              or paste notes. Google Drive PDFs
              cannot be read automatically from a
              restricted link. PDF text and lesson
              notes stay in this browser; only approved
              practice questions are saved.
            </p>

            <label className="lb-practice-file">
              <FileUp size={18} />
              Upload PDF (max 5 MB)

              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handlePdf}
              />
            </label>

            {pdfName && (
              <p className="muted tiny">
                Loaded: {pdfName}
              </p>
            )}

            <label className="lb-practice-label">
              Lesson notes

              <textarea
                rows={8}
                value={notes}
                maxLength={11000}
                onChange={e => {
                  setNotes(e.target.value);
                  setPdfName("");
                }}
                placeholder="Paste lesson notes or upload a text-based PDF..."
              />
            </label>

            <div className="lb-practice-actions">
              <button
                className="button"
                onClick={generate}
                disabled={busy}
              >
                <BrainCircuit size={17} />
                {busy
                  ? "Generating drafts..."
                  : "Generate draft activities locally"}
              </button>

              <button
                className="subtle-button"
                onClick={() => {
                  setCards(tenCards());
                  setQuestions(tenQuizzes());
                  setPublished(false);
                  setNotice(
                    "Created blank drafts to edit manually."
                  );
                }}
                disabled={busy}
              >
                <Plus size={16} />
                Start with blank drafts
              </button>
            </div>

            {modelState === "loading" && (
              <p className="muted tiny">
                Loading AI: {progress}
              </p>
            )}
          </div>

          <div className="panel lb-practice-editor">
            <h2>Step 2 - Review and correct every answer</h2>

            <p className="muted tiny">
              The local model may make mistakes,
              omit answers, or produce fewer than
              10 valid drafts. Edit all 10 flashcards
              and all 10 questions yourself before
              publishing. Unpublished drafts disappear
              on reload.
            </p>

            <div className="lb-practice-tabs">
              <button
                className={
                  tab === "flashcards" ? "selected" : ""
                }
                onClick={() => setTab("flashcards")}
              >
                10 Flashcards
              </button>

              <button
                className={
                  tab === "quizzes" ? "selected" : ""
                }
                onClick={() => setTab("quizzes")}
              >
                10 Quiz questions
              </button>
            </div>

            {tab === "flashcards"
              ? cards.map((c, index) => (
                  <div
                    className="lb-practice-item"
                    key={index}
                  >
                    <b>Flashcard {index + 1}</b>

                    <label>
                      Question / front
                      <input
                        maxLength={500}
                        value={c.front}
                        onChange={e =>
                          updateCard(
                            index,
                            "front",
                            e.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      Answer / back
                      <textarea
                        rows={2}
                        maxLength={700}
                        value={c.back}
                        onChange={e =>
                          updateCard(
                            index,
                            "back",
                            e.target.value
                          )
                        }
                      />
                    </label>
                  </div>
                ))
              : questions.map((q, index) => (
                  <div
                    className="lb-practice-item"
                    key={index}
                  >
                    <b>Question {index + 1}</b>

                    <label>
                      Question
                      <input
                        maxLength={500}
                        value={q.prompt}
                        onChange={e =>
                          updateQuiz(
                            index,
                            "prompt",
                            e.target.value
                          )
                        }
                      />
                    </label>

                    {q.options.map((choice, i) => (
                      <label key={i}>
                        Choice {String.fromCharCode(65 + i)}

                        <input
                          maxLength={250}
                          value={choice}
                          onChange={e =>
                            updateChoice(
                              index,
                              i,
                              e.target.value
                            )
                          }
                        />
                      </label>
                    ))}

                    <label>
                      Correct answer

                      <select
                        value={q.answerIndex ?? ""}
                        onChange={e =>
                          updateQuiz(
                            index,
                            "answerIndex",
                            e.target.value === ""
                              ? null
                              : Number(e.target.value)
                          )
                        }
                      >
                        <option value="">
                          Select the verified answer
                        </option>

                        {q.options.map((_, i) => (
                          <option key={i} value={i}>
                            Choice{" "}
                            {String.fromCharCode(65 + i)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Explanation (optional)

                      <textarea
                        rows={2}
                        maxLength={600}
                        value={q.explanation}
                        onChange={e =>
                          updateQuiz(
                            index,
                            "explanation",
                            e.target.value
                          )
                        }
                      />
                    </label>
                  </div>
                ))}
          </div>

          <div className="panel">
            <h2>Step 3 - Publish approved activities</h2>

            <p className="muted tiny">
              This replaces the previously published
              activity set for this class. Students'
              practice attempts and answers are not
              stored in Firestore.
            </p>

            <button
              className="button"
              disabled={busy}
              onClick={publish}
            >
              <CheckCircle2 size={18} />

              {published
                ? "Republish reviewed activities"
                : "Publish 10 flashcards + 10 questions"}
            </button>
          </div>
        </>
      ) : !published ? (
        <div className="panel empty-small">
          Your tutor hasn't published practice
          activities for this class yet.
        </div>
      ) : (
        <>
          <div className="lb-practice-tabs">
            <button
              className={
                tab === "flashcards" ? "selected" : ""
              }
              onClick={() => setTab("flashcards")}
            >
              <Layers size={17} />
              Flashcards
            </button>

            <button
              className={
                tab === "quizzes" ? "selected" : ""
              }
              onClick={() => setTab("quizzes")}
            >
              <BookOpenCheck size={17} />
              Quiz
            </button>
          </div>

          {tab === "flashcards" ? (
            <div className="panel lb-study-card">
              <p className="muted tiny">
                Flashcard {cardIndex + 1} of {cards.length}
                {" - "}Click to flip
              </p>

              <button
                type="button"
                className="lb-flashcard"
                onClick={() => setFlipped(!flipped)}
              >
                <span>
                  {flipped
                    ? cards[cardIndex]?.back
                    : cards[cardIndex]?.front}
                </span>

                <small>
                  {flipped ? "Answer" : "Question"}
                </small>
              </button>

              <div className="lb-practice-actions">
                <button
                  className="subtle-button"
                  onClick={() => {
                    setCardIndex(i => Math.max(0, i - 1));
                    setFlipped(false);
                  }}
                  disabled={cardIndex === 0}
                >
                  Previous
                </button>

                <button
                  className="subtle-button"
                  onClick={() => {
                    setCardIndex(i =>
                      Math.min(cards.length - 1, i + 1)
                    );
                    setFlipped(false);
                  }}
                  disabled={cardIndex >= cards.length - 1}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className="panel lb-study-card">
              <p className="muted tiny">
                Question {quizIndex + 1} of{" "}
                {questions.length}
              </p>

              <h2>{quiz?.prompt}</h2>

              <div className="lb-quiz-options">
                {quiz?.options.map((option, index) => (
                  <label key={index}>
                    <input
                      type="radio"
                      checked={
                        answers[quizIndex] === index
                      }
                      disabled={Boolean(
                        checked[quizIndex]
                      )}
                      onChange={() =>
                        setAnswers(old => ({
                          ...old,
                          [quizIndex]: index
                        }))
                      }
                    />

                    <span>
                      {String.fromCharCode(65 + index)}.{" "}
                      {option}
                    </span>
                  </label>
                ))}
              </div>

              {checked[quizIndex] && (
                <div
                  className="hint-box"
                  style={{
                    marginTop: 15,
                    justifyContent: "start"
                  }}
                >
                  <strong>
                    {answers[quizIndex] === quiz.answerIndex
                      ? "Correct!"
                      : "Not quite."}
                  </strong>

                  Correct answer:{" "}
                  {quiz.options[quiz.answerIndex]}.
                  {" "}{quiz.explanation}
                </div>
              )}

              <div className="lb-practice-actions">
                <button
                  className="button"
                  disabled={
                    answers[quizIndex] === undefined ||
                    Boolean(checked[quizIndex])
                  }
                  onClick={() =>
                    setChecked(old => ({
                      ...old,
                      [quizIndex]: true
                    }))
                  }
                >
                  Check answer
                </button>

                <button
                  className="subtle-button"
                  onClick={() =>
                    setQuizIndex(i => Math.max(0, i - 1))
                  }
                  disabled={quizIndex === 0}
                >
                  Previous
                </button>

                <button
                  className="subtle-button"
                  onClick={() =>
                    setQuizIndex(i =>
                      Math.min(
                        questions.length - 1,
                        i + 1
                      )
                    )
                  }
                  disabled={
                    quizIndex >= questions.length - 1
                  }
                >
                  Next
                </button>
              </div>

              <p className="muted tiny">
                Checked {answeredCount}/{questions.length}
                {" · "}Correct {correctCount}.
                Reloading clears this session.
              </p>

              <button
                className="subtle-button"
                onClick={resetPractice}
              >
                Restart practice
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        .lb-practice-page {
          padding-top: 40px;
        }

        .lb-practice-page .panel {
          margin: 20px 0;
        }

        .lb-practice-page h2 {
          font-size: 20px;
          margin-bottom: 12px;
        }

        .lb-practice-select {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .lb-practice-page label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: #465677;
          font-size: 13px;
          font-weight: 800;
        }

        .lb-practice-page
        input:not([type=radio]):not([type=file]),
        .lb-practice-page select,
        .lb-practice-page textarea {
          width: 100%;
          border: 1px solid #d9e3f1;
          border-radius: 9px;
          padding: 11px;
          font: inherit;
          color: #243659;
          background: white;
        }

        .lb-practice-page textarea {
          resize: vertical;
        }

        .lb-practice-label {
          margin: 16px 0;
        }

        .lb-practice-file {
          display: inline-flex !important;
          align-items: center;
          flex-direction: row !important;
          gap: 9px !important;
          background: #ecf2ff;
          color: #365ece !important;
          padding: 13px;
          border-radius: 10px;
          cursor: pointer;
        }

        .lb-practice-file input {
          max-width: 220px;
          font-size: 12px;
        }

        .lb-practice-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 11px;
          margin-top: 16px;
        }

        .lb-practice-tabs {
          display: flex;
          gap: 10px;
          margin: 14px 0;
        }

        .lb-practice-tabs button {
          border: 1px solid #d6e2f7;
          background: #f5f7ff;
          border-radius: 10px;
          padding: 11px 16px;
          color: #556787;
          font-weight: 800;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .lb-practice-tabs button.selected {
          background: #456cdd;
          color: white;
        }

        .lb-practice-item {
          padding: 18px;
          margin-top: 12px;
          border: 1px solid #e4eafa;
          border-radius: 12px;
          display: grid;
          gap: 10px;
        }

        .lb-practice-item > b {
          color: #24395d;
        }

        .lb-flashcard {
          width: 100%;
          min-height: 230px;
          border: 2px solid #c5d4f5;
          background: #f6f9ff;
          border-radius: 17px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          text-align: center;
          padding: 24px;
          color: #1e3157;
        }

        .lb-flashcard span {
          font-size: 24px;
          font-weight: 800;
        }

        .lb-flashcard small {
          color: #6b7e9d;
        }

        .lb-quiz-options {
          display: grid;
          gap: 10px;
        }

        .lb-quiz-options label {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 10px;
          padding: 13px;
          border: 1px solid #e4eafa;
          border-radius: 9px;
          font-weight: 600;
        }

        @media (max-width: 700px) {
          .lb-practice-select {
            grid-template-columns: 1fr;
          }

          .lb-flashcard span {
            font-size: 20px;
          }
        }
      `}</style>
    </section>
  );
}
