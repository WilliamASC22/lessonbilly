
import { useEffect, useState } from "react";
import {
  BookOpenCheck,
  CheckCircle2,
  FileUp,
  Layers,
  Plus,
  WandSparkles
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

const emptyCard = () => ({
  front: "",
  back: ""
});

const emptyQuiz = () => ({
  prompt: "",
  options: ["", "", "", ""],
  answerIndex: null,
  explanation: ""
});

const tenCards = () =>
  Array.from({ length: 10 }, emptyCard);

const tenQuizzes = () =>
  Array.from({ length: 10 }, emptyQuiz);

const trim = value =>
  String(value || "").trim();

const classList = student =>
  Array.isArray(student?.classes) &&
  student.classes.length
    ? student.classes
    : [
        {
          id: "original",
          name:
            student?.subject ||
            "General tutoring"
        }
      ];

function parseFlashcards(text) {
  return text
    .split(/\r?\n/)
    .map(line =>
      line
        .replace(/^\s*\d+[.)]\s*/, "")
        .trim()
    )
    .filter(line =>
      /^CARD\s*\|/i.test(line)
    )
    .map(line => {
      const parts = line
        .split("|")
        .map(trim);

      return {
        front: parts[1] || "",
        back:
          parts.slice(2).join(" | ") ||
          ""
      };
    })
    .filter(card =>
      card.front && card.back
    )
    .slice(0, 10);
}

function parseQuizzes(text) {
  return text
    .split(/\r?\n/)
    .map(line =>
      line
        .replace(/^\s*\d+[.)]\s*/, "")
        .trim()
    )
    .filter(line =>
      /^QUIZ\s*\|/i.test(line)
    )
    .map(line => {
      const parts = line
        .split("|")
        .map(trim);

      const answer = Number(parts[6]);

      return {
        prompt: parts[1] || "",
        options: [
          parts[2] || "",
          parts[3] || "",
          parts[4] || "",
          parts[5] || ""
        ],
        answerIndex:
          [1, 2, 3, 4].includes(answer)
            ? answer - 1
            : null,
        explanation:
          parts.slice(7).join(" | ") ||
          ""
      };
    })
    .filter(q =>
      q.prompt &&
      q.options.every(Boolean)
    )
    .slice(0, 10);
}

// Extract explicit question-and-answer pairs.
// Do not guess answers from arbitrary notes.
function extractStudyPairs(text) {
  const pairs = [
    ...parseFlashcards(text)
  ];

  const seen = new Set(
    pairs.map(p =>
      p.front.toLowerCase()
    )
  );

  const lines = text
    .split(/\r?\n/)
    .map(x => x.trim())
    .filter(Boolean);

  let pending = "";

  function add(front, back) {
    const question = trim(front).slice(
      0,
      500
    );

    const answer = trim(back).slice(
      0,
      700
    );

    if (
      !question ||
      !answer ||
      seen.has(question.toLowerCase())
    ) {
      return;
    }

    pairs.push({
      front: question,
      back: answer
    });

    seen.add(
      question.toLowerCase()
    );
  }

  for (const line of lines) {
    if (
      /^(CARD|QUIZ)\s*\|/i.test(line)
    ) {
      continue;
    }

    const qa = line.match(
      /^(?:Q(?:uestion)?\s*[:.-]\s*)(.+?)\s*\|\s*(.+)$/i
    );

    if (qa) {
      add(qa[1], qa[2]);
      pending = "";
      continue;
    }

    const pipe = line.match(
      /^(.{5,200}\?)\s*\|\s*(.{2,500})$/
    );

    if (pipe) {
      add(pipe[1], pipe[2]);
      pending = "";
      continue;
    }

    const ask = line.match(
      /^(?:Q(?:uestion)?|Front)\s*(?:\d+)?\s*[:.-]\s*(.+)$/i
    );

    if (ask) {
      pending = ask[1];
      continue;
    }

    const answer = line.match(
      /^(?:A(?:nswer)?|Back)\s*(?:\d+)?\s*[:.-]\s*(.+)$/i
    );

    if (answer && pending) {
      add(pending, answer[1]);
      pending = "";
      continue;
    }

    const definition = line.match(
      /^([^:?!]{3,60}):\s*(.{8,450})$/
    );

    if (
      definition &&
      !/^((step|example|chapter|page|topic|lesson|grade|subject|note|instructions)\b)/i.test(
        definition[1]
      )
    ) {
      add(
        `Explain ${definition[1].trim()}.`,
        definition[2]
      );

      pending = "";
    }
  }

  return pairs.slice(0, 10);
}

function draftFromNotes(text) {
  const flashcards =
    extractStudyPairs(text);

  const explicitQuiz =
    parseQuizzes(text);

  const quizzes = [
    ...explicitQuiz
  ];

  if (
    quizzes.length === 0 &&
    flashcards.length >= 4
  ) {
    flashcards.forEach(
      (card, index) => {
        if (
          quizzes.length === 10
        ) {
          return;
        }

        const otherAnswers =
          flashcards
            .filter(
              (item, i) =>
                i !== index &&
                item.back.toLowerCase() !==
                  card.back.toLowerCase()
            )
            .map(item => item.back)
            .filter(
              (answer, i, all) =>
                all.findIndex(
                  a =>
                    a.toLowerCase() ===
                    answer.toLowerCase()
                ) === i
            );

        if (
          otherAnswers.length < 3
        ) {
          return;
        }

        const distractors = [
          0, 1, 2
        ].map(
          offset =>
            otherAnswers[
              (index * 3 + offset) %
              otherAnswers.length
            ]
        );

        const answerIndex =
          index % 4;

        const options = [
          ...distractors
        ];

        options.splice(
          answerIndex,
          0,
          card.back
        );

        quizzes.push({
          prompt: card.front,
          options: options.map(
            x => x.slice(0, 250)
          ),
          answerIndex,
          explanation:
            "Based on the answer provided in your lesson notes. Verify all choices before publishing."
        });
      }
    );
  }

  return {
    flashcards,
    quizzes: quizzes.slice(0, 10)
  };
}

// Read text-based PDFs only.
// The PDF is not uploaded to Firebase or Drive.
async function readPdf(file) {
  if (
    !file.name
      .toLowerCase()
      .endsWith(".pdf")
  ) {
    throw new Error(
      "Choose a PDF file."
    );
  }

  if (
    !file.size ||
    file.size >
      5 * 1024 * 1024
  ) {
    throw new Error(
      "Use a PDF between 1 byte and 5 MB."
    );
  }

  const pdfjs = await import(
    "pdfjs-dist"
  );

  pdfjs.GlobalWorkerOptions.workerSrc =
    pdfWorkerUrl;

  const loadingTask =
    pdfjs.getDocument({
      data: new Uint8Array(
        await file.arrayBuffer()
      )
    });

  let text = "";

  try {
    const pdf =
      await loadingTask.promise;

    const pages = Math.min(
      pdf.numPages,
      12
    );

    for (
      let index = 1;
      index <= pages;
      index++
    ) {
      const page =
        await pdf.getPage(index);

      const content =
        await page.getTextContent();

      text +=
        "\n" +
        content.items
          .map(
            item =>
              (item.str || "") +
              (item.hasEOL
                ? "\n"
                : " ")
          )
          .join("");

      if (
        text.length > 11000
      ) {
        break;
      }
    }
  } finally {
    try {
      if (
        typeof loadingTask.destroy ===
        "function"
      ) {
        await loadingTask.destroy();
      }
    } catch (error) {
      console.warn(
        "PDF cleanup warning:",
        error
      );
    }
  }

  if (!text.trim()) {
    throw new Error(
      "This PDF has no selectable text. Paste notes instead."
    );
  }

  return text.slice(0, 11000);
}

export default function PracticeCenter({
  user,
  isTutor,
  role
}) {
  const [students, setStudents] =
    useState([]);

  const [studentId, setStudentId] =
    useState("");

  const [classId, setClassId] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [pdfName, setPdfName] =
    useState("");

  const [cards, setCards] =
    useState(tenCards);

  const [questions, setQuestions] =
    useState(tenQuizzes);

  const [published, setPublished] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  const [notice, setNotice] =
    useState("");

  const [tab, setTab] =
    useState("flashcards");

  const [cardIndex, setCardIndex] =
    useState(0);

  const [flipped, setFlipped] =
    useState(false);

  const [quizIndex, setQuizIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState({});

  const [checked, setChecked] =
    useState({});

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
      snapshot => {
        setStudents(
          snapshot.docs.map(d => ({
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
  }, [
    user.uid,
    isTutor,
    role
  ]);

  useEffect(() => {
    if (
      !students.some(
        s => s.id === studentId
      )
    ) {
      setStudentId(
        students[0]?.id || ""
      );
    }
  }, [
    students,
    studentId
  ]);

  const student = students.find(
    s => s.id === studentId
  );

  const classes =
    classList(student);

  const selectedClass =
    classes.find(
      c => c.id === classId
    ) || classes[0];

  useEffect(() => {
    if (
      !studentId ||
      !selectedClass?.id
    ) {
      return;
    }

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
      .then(snapshot => {
        if (!alive) return;

        if (
          snapshot.exists() &&
          snapshot.data().published
        ) {
          const data =
            snapshot.data();

          setCards(
            data.flashcards ||
              tenCards()
          );

          setQuestions(
            data.questions ||
              tenQuizzes()
          );

          setPublished(true);
        }
      })
      .catch(e => {
        if (alive) {
          setError(e.message);
        }
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
        }
      });

    return () => {
      alive = false;
    };
  }, [
    studentId,
    selectedClass?.id
  ]);

  function resetPractice() {
    setCardIndex(0);
    setQuizIndex(0);
    setFlipped(false);
    setAnswers({});
    setChecked({});
  }

  function updateCard(
    index,
    key,
    value
  ) {
    setCards(old =>
      old.map((card, i) =>
        i === index
          ? {
              ...card,
              [key]: value
            }
          : card
      )
    );
  }

  function updateQuiz(
    index,
    key,
    value
  ) {
    setQuestions(old =>
      old.map((q, i) =>
        i === index
          ? {
              ...q,
              [key]: value
            }
          : q
      )
    );
  }

  function updateChoice(
    index,
    choice,
    value
  ) {
    setQuestions(old =>
      old.map((q, i) =>
        i === index
          ? {
              ...q,
              options:
                q.options.map(
                  (option, j) =>
                    j === choice
                      ? value
                      : option
                )
            }
          : q
      )
    );
  }

  async function handlePdf(event) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setError("");
    setNotice("");

    try {
      if (
        !file.name
          .toLowerCase()
          .endsWith(".pdf")
      ) {
        throw new Error(
          "Choose a PDF file."
        );
      }

      setNotes(
        await readPdf(file)
      );

      setPdfName(file.name);

      setNotice(
        "PDF text extracted. Review it before creating activities."
      );
    } catch (e) {
      setError(e.message);
    }
  }

  function generate() {
    if (!notes.trim()) {
      setError(
        "Paste lesson material or upload a text-based PDF first."
      );
      return;
    }

    setError("");

    const result =
      draftFromNotes(notes);

    setCards(
      [
        ...result.flashcards,
        ...tenCards()
      ].slice(0, 10)
    );

    setQuestions(
      [
        ...result.quizzes,
        ...tenQuizzes()
      ].slice(0, 10)
    );

    setPublished(false);

    if (
      !result.flashcards.length &&
      !result.quizzes.length
    ) {
      setNotice(
        "No explicit questions and answers were found. Add them as Q: ... then A: ... on separate lines, or fill in the blank templates. The tool will not guess answers."
      );
    } else {
      setNotice(
        `Created ${result.flashcards.length}/10 flashcard drafts and ${result.quizzes.length}/10 quiz drafts from your notes. Verify every answer and distractor, then finish the remaining blanks before publishing.`
      );
    }
  }

  async function publish(event) {
    event.preventDefault();

    if (
      !studentId ||
      !selectedClass
    ) {
      return;
    }

    const invalid =
      cards.length !== 10 ||
      questions.length !== 10 ||
      cards.some(
        c =>
          !trim(c.front) ||
          !trim(c.back)
      ) ||
      questions.some(
        q =>
          !trim(q.prompt) ||
          q.options?.length !== 4 ||
          q.options.some(
            a => !trim(a)
          ) ||
          !Number.isInteger(
            q.answerIndex
          ) ||
          q.answerIndex < 0 ||
          q.answerIndex > 3
      );

    if (invalid) {
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
          classId:
            selectedClass.id,

          flashcards:
            cards.map(c => ({
              front:
                trim(c.front).slice(
                  0,
                  500
                ),
              back:
                trim(c.back).slice(
                  0,
                  700
                )
            })),

          questions:
            questions.map(q => ({
              prompt:
                trim(q.prompt).slice(
                  0,
                  500
                ),

              options:
                q.options.map(x =>
                  trim(x).slice(
                    0,
                    250
                  )
                ),

              answerIndex:
                q.answerIndex,

              explanation:
                trim(
                  q.explanation
                ).slice(
                  0,
                  600
                )
            })),

          updatedAt:
            serverTimestamp()
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

  const quiz =
    questions[quizIndex];

  const answeredCount =
    Object.keys(checked).length;

  const correctCount =
    Object.entries(checked).filter(
      ([index]) =>
        answers[index] ===
        questions[
          Number(index)
        ]?.answerIndex
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
              style={{
                verticalAlign: "middle"
              }}
            />
            Practice Center
          </h1>

          <p>
            {isTutor
              ? "Extract, review and publish practice for a specific class - without running a large AI model."
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
        <div
          className="alert"
          role="alert"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          className="success-note"
          role="status"
        >
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
            <option value="">
              Choose a student
            </option>

            {students.map(s => (
              <option
                key={s.id}
                value={s.id}
              >
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Class

          <select
            value={
              selectedClass?.id || ""
            }
            onChange={e =>
              setClassId(e.target.value)
            }
            disabled={!student}
          >
            <option value="">
              Choose a class
            </option>

            {classes.map(c => (
              <option
                key={c.id}
                value={c.id}
              >
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

      {!loading &&
        !students.length && (
          <div className="panel empty-small">
            {isTutor
              ? "Add a student from Dashboard first."
              : "Ask your tutor to link your account to a student record."}
          </div>
        )}

      {!student ||
      !selectedClass ? null : isTutor ? (
        <>
          <div className="panel">
            <h2>
              Step 1 - Provide lesson material
            </h2>

            <p className="muted tiny">
              Upload a text-based PDF or paste
              notes. For reliable drafts,
              format each pair on two lines:
              {" "}
              <strong>
                Q: What is a numerator?
              </strong>
              {" "}
              then{" "}
              <strong>
                A: The top number in a fraction.
              </strong>
              {" "}
              You can also use{" "}
              <strong>
                CARD|question|answer
              </strong>
              {" "}
              or{" "}
              <strong>
                QUIZ|question|A|B|C|D|correct number 1-4|explanation
              </strong>
              . This tool does not invent
              answers from unstructured text.
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
                <WandSparkles size={17} />
                Build drafts from answer pairs
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
          </div>

          <div className="panel lb-practice-editor">
            <h2>
              Step 2 - Review and correct every answer
            </h2>

            <p className="muted tiny">
              Quiz distractors are pulled from
              other answers in your notes and may
              be misleading or wrong. Verify
              every choice, question and answer
              key before publishing. If the
              source lacks explicit answer pairs,
              enter questions manually.
              Unpublished drafts disappear
              on reload.
            </p>

            <div className="lb-practice-tabs">
              <button
                className={
                  tab === "flashcards"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setTab("flashcards")
                }
              >
                10 Flashcards
              </button>

              <button
                className={
                  tab === "quizzes"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setTab("quizzes")
                }
              >
                10 Quiz questions
              </button>
            </div>

            {tab === "flashcards"
              ? cards.map(
                  (c, index) => (
                    <div
                      className="lb-practice-item"
                      key={index}
                    >
                      <b>
                        Flashcard {index + 1}
                      </b>

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
                  )
                )
              : questions.map(
                  (q, index) => (
                    <div
                      className="lb-practice-item"
                      key={index}
                    >
                      <b>
                        Question {index + 1}
                      </b>

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

                      {q.options.map(
                        (choice, i) => (
                          <label key={i}>
                            Choice{" "}
                            {String.fromCharCode(
                              65 + i
                            )}

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
                        )
                      )}

                      <label>
                        Correct answer

                        <select
                          value={
                            q.answerIndex ?? ""
                          }
                          onChange={e =>
                            updateQuiz(
                              index,
                              "answerIndex",
                              e.target.value === ""
                                ? null
                                : Number(
                                    e.target.value
                                  )
                            )
                          }
                        >
                          <option value="">
                            Select the verified answer
                          </option>

                          {q.options.map(
                            (_, i) => (
                              <option
                                key={i}
                                value={i}
                              >
                                Choice{" "}
                                {String.fromCharCode(
                                  65 + i
                                )}
                              </option>
                            )
                          )}
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
                  )
                )}
          </div>

          <div className="panel">
            <h2>
              Step 3 - Publish approved activities
            </h2>

            <p className="muted tiny">
              This replaces the previously
              published activity set for
              this class. Students' practice
              attempts and answers are not
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
                tab === "flashcards"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setTab("flashcards")
              }
            >
              <Layers size={17} />
              Flashcards
            </button>

            <button
              className={
                tab === "quizzes"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setTab("quizzes")
              }
            >
              <BookOpenCheck size={17} />
              Quiz
            </button>
          </div>

          {tab === "flashcards" ? (
            <div className="panel lb-study-card">
              <p className="muted tiny">
                Flashcard {cardIndex + 1} of{" "}
                {cards.length} - Click to flip
              </p>

              <button
                type="button"
                className="lb-flashcard"
                onClick={() =>
                  setFlipped(!flipped)
                }
              >
                <span>
                  {flipped
                    ? cards[cardIndex]?.back
                    : cards[cardIndex]?.front}
                </span>

                <small>
                  {flipped
                    ? "Answer"
                    : "Question"}
                </small>
              </button>

              <div className="lb-practice-actions">
                <button
                  className="subtle-button"
                  onClick={() => {
                    setCardIndex(i =>
                      Math.max(0, i - 1)
                    );
                    setFlipped(false);
                  }}
                  disabled={
                    cardIndex === 0
                  }
                >
                  Previous
                </button>

                <button
                  className="subtle-button"
                  onClick={() => {
                    setCardIndex(i =>
                      Math.min(
                        cards.length - 1,
                        i + 1
                      )
                    );
                    setFlipped(false);
                  }}
                  disabled={
                    cardIndex >=
                    cards.length - 1
                  }
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
                {quiz?.options.map(
                  (option, index) => (
                    <label key={index}>
                      <input
                        type="radio"
                        checked={
                          answers[quizIndex] ===
                          index
                        }
                        disabled={Boolean(
                          checked[quizIndex]
                        )}
                        onChange={() =>
                          setAnswers(old => ({
                            ...old,
                            [quizIndex]:
                              index
                          }))
                        }
                      />

                      <span>
                        {String.fromCharCode(
                          65 + index
                        )}
                        . {option}
                      </span>
                    </label>
                  )
                )}
              </div>

              {checked[quizIndex] && (
                <div
                  className="hint-box"
                  style={{
                    marginTop: 15,
                    justifyContent:
                      "start"
                  }}
                >
                  <strong>
                    {answers[quizIndex] ===
                    quiz.answerIndex
                      ? "Correct!"
                      : "Not quite."}
                  </strong>
                  {" "}Correct answer:{" "}
                  {quiz.options[
                    quiz.answerIndex
                  ]}
                  . {quiz.explanation}
                </div>
              )}

              <div className="lb-practice-actions">
                <button
                  className="button"
                  disabled={
                    answers[quizIndex] ===
                      undefined ||
                    Boolean(
                      checked[quizIndex]
                    )
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
                    setQuizIndex(i =>
                      Math.max(0, i - 1)
                    )
                  }
                  disabled={
                    quizIndex === 0
                  }
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
                    quizIndex >=
                    questions.length - 1
                  }
                >
                  Next
                </button>
              </div>

              <p className="muted tiny">
                Checked {answeredCount}/
                {questions.length}
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
