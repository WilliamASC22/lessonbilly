
import { useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCopy,
  GraduationCap,
  Mail,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import {
  AREA_LABELS,
  TUTORING_GOALS,
  predictLearningArea,
  buildTutoringMatch,
  formatTutoringInquiry
} from "./learningClassifier.js";

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;

export default function LearningNeedsAssistant() {
  const [grade, setGrade] = useState("Grade 8");
  const [subjectChoice, setSubjectChoice] = useState("auto");
  const [otherSubject, setOtherSubject] = useState("");
  const [goal, setGoal] = useState("catch_up");
  const [hours, setHours] = useState("2");
  const [challenge, setChallenge] = useState("");
  const [match, setMatch] = useState(null);
  const [copied, setCopied] = useState(false);

  function clearPreviousMatch() {
    setMatch(null);
    setCopied(false);
  }

  function findMatch(event) {
    event.preventDefault();

    const description = challenge.trim().slice(0, 400);

    if (description.length < 10) return;

    const prediction = predictLearningArea(description);

    const subject =
      subjectChoice === "auto"
        ? prediction.area
        : subjectChoice;

    setMatch({
      details: buildTutoringMatch({
        area: subject,
        gradeLevel: grade,
        challenge: description,
        goal,
        weeklyHours: Number(hours),
        otherSubject: otherSubject.trim()
      }),
      uncertain:
        subjectChoice === "auto" && prediction.uncertain
    });

    setCopied(false);
  }

  const inquiry = match
    ? formatTutoringInquiry(match.details)
    : "";

  async function copyInquiry() {
    if (!inquiry) return;

    try {
      await navigator.clipboard.writeText(inquiry);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      className="lb-match"
      id="tutor-match"
      aria-labelledby="lb-match-heading"
    >
      <div className="lb-match-top">
        <span className="lb-match-symbol">
          <Sparkles size={22} />
        </span>

        <div>
          <span className="section-kicker">
            AI-POWERED TUTORING MATCH
          </span>

          <h3 id="lb-match-heading">
            What kind of tutoring would help?
          </h3>

          <p>
            Tell us what schoolwork is challenging.
            Our lightweight model helps identify a
            possible tutoring focus and prepares an
            inquiry you can send directly to the tutor.
          </p>
        </div>
      </div>

      <form
        className="lb-match-form"
        onSubmit={findMatch}
      >
        <label>
          Grade level

          <select
            value={grade}
            onChange={event => {
              setGrade(event.target.value);
              clearPreviousMatch();
            }}
          >
            <option value="Kindergarten">
              Kindergarten
            </option>

            {Array.from({ length: 12 }, (_, i) => (
              <option
                key={i + 1}
                value={`Grade ${i + 1}`}
              >
                Grade {i + 1}
              </option>
            ))}

            <option value="College">
              College
            </option>
          </select>
        </label>

        <label>
          Subject

          <select
            value={subjectChoice}
            onChange={event => {
              setSubjectChoice(event.target.value);
              clearPreviousMatch();
            }}
          >
            <option value="auto">
              Let AI suggest a subject
            </option>

            {Object.entries(AREA_LABELS).map(
              ([value, label]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              )
            )}
          </select>
        </label>

        {subjectChoice === "other" && (
          <label>
            Which subject?

            <input
              type="text"
              required
              maxLength={60}
              placeholder="e.g. History, Economics, Programming"
              value={otherSubject}
              onChange={event => {
                setOtherSubject(event.target.value);
                clearPreviousMatch();
              }}
            />
          </label>
        )}

        <label>
          Main tutoring goal

          <select
            value={goal}
            onChange={event => {
              setGoal(event.target.value);
              clearPreviousMatch();
            }}
          >
            {TUTORING_GOALS.map(option => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Preferred hours per week

          <select
            value={hours}
            onChange={event => {
              setHours(event.target.value);
              clearPreviousMatch();
            }}
          >
            <option value="2">
              2 hours (recommended starting point)
            </option>

            <option value="3">
              3 hours
            </option>

            <option value="4">
              4 hours
            </option>
          </select>
        </label>

        <label className="lb-match-full">
          What is the student struggling with?

          <textarea
            rows={3}
            required
            minLength={10}
            maxLength={400}
            value={challenge}
            onChange={event => {
              setChallenge(event.target.value);
              clearPreviousMatch();
            }}
            placeholder="Example: Fractions and word problems are making Grade 8 math difficult. We want regular one-on-one help."
          />

          <small>
            No names or other personal details needed.
          </small>
        </label>

        <button
          className="button lb-match-submit"
          type="submit"
        >
          Find my tutoring match
          <ArrowRight size={17} />
        </button>
      </form>

      {match && (
        <div
          className="lb-match-result"
          role="status"
        >
          <div className="lb-match-result-title">
            <CheckCircle2 size={22} />

            <div>
              <span className="lb-match-eyebrow">
                POTENTIAL TUTORING MATCH
              </span>

              <h4>
                {match.details.subject} -{" "}
                {match.details.gradeLevel}
              </h4>
            </div>
          </div>

          {match.uncertain && (
            <p className="lb-match-warning">
              Your description might fit several
              subjects. Select the subject manually
              above if this suggestion isn't right.
            </p>
          )}

          <p className="lb-match-focus">
            {match.details.focus}
          </p>

          <p className="lb-match-emphasis">
            {match.details.emphasis}
          </p>

          <div className="lb-match-cards">
            <div>
              <GraduationCap size={19} />
              <strong>First tutoring session</strong>
              <p>{match.details.sessionOne}</p>
            </div>

            <div>
              <BookOpenCheck size={19} />
              <strong>Follow-up tutoring</strong>
              <p>{match.details.sessionTwo}</p>
            </div>

            <div>
              <ShieldCheck size={19} />
              <strong>Family progress updates</strong>
              <p>{match.details.progress}</p>
            </div>
          </div>

          <div className="lb-match-conversion">
            <div>
              <span>
                Illustrative weekly tutoring cost
              </span>

              <strong>
                ${match.details.estimatedWeekly}
                <small> / week</small>
              </strong>

              <p>
                {match.details.weeklyHours} hours ×
                $25/hour. Availability, subject fit,
                and scheduling are confirmed by the tutor.
              </p>
            </div>

            <div className="lb-match-actions">
              {CONTACT_EMAIL && (
                <a
                  className="button"
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                    `LessonBilly tutoring inquiry - ${match.details.subject}`
                  )}&body=${encodeURIComponent(inquiry)}`}
                >
                  <Mail size={17} />
                  Request tutoring availability
                </a>
              )}

              <button
                className="lb-match-copy"
                type="button"
                onClick={copyInquiry}
              >
                <ClipboardCopy size={16} />

                {copied
                  ? "Inquiry copied"
                  : "Copy my inquiry"}
              </button>
            </div>
          </div>

          <details className="lb-match-preview">
            <summary>
              Preview the message you can send
            </summary>

            <pre>{inquiry}</pre>
          </details>
        </div>
      )}

      <p className="lb-match-fineprint">
        This is a lightweight Naive Bayes text classifier
        trained on example descriptions, not a generative
        chatbot or a validated educational assessment.
        It runs in this browser without a GPU, API key,
        or daily AI quota. Nothing is submitted to
        LessonBilly unless you choose to send an email.
      </p>

      <style>{`
        .lb-match {
          max-width: 960px;
          margin: 32px auto 0;
          background: #fff;
          border: 1px solid #dfe7f7;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 16px 35px #263f9e0b;
        }

        .lb-match-top {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .lb-match-symbol {
          display: flex;
          background: #eaf0ff;
          color: #4268db;
          padding: 12px;
          border-radius: 12px;
        }

        .lb-match-top h3 {
          font-size: 26px;
          margin: 6px 0 8px;
          color: #1e3157;
        }

        .lb-match-top p {
          font-size: 14px;
          color: #61738e;
          line-height: 1.7;
          margin: 0;
        }

        .lb-match-form {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 24px;
        }

        .lb-match-form label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 13px;
          color: #435777;
          font-weight: 800;
        }

        .lb-match-form label small {
          color: #7b8ba2;
          font-size: 11px;
          font-weight: 500;
        }

        .lb-match-full {
          grid-column: 1 / -1;
        }

        .lb-match-form select,
        .lb-match-form input[type="text"],
        .lb-match-form textarea {
          width: 100%;
          border: 1px solid #d9e3f1;
          border-radius: 10px;
          background: white;
          color: #253858;
          padding: 12px;
          font: inherit;
          min-width: 0;
        }

        .lb-match-form textarea {
          resize: vertical;
        }

        .lb-match-submit {
          justify-self: start;
        }

        .lb-match-result {
          margin-top: 23px;
          padding: 20px;
          border: 1px solid #c6d6f7;
          border-radius: 14px;
          background: #f6f9ff;
        }

        .lb-match-result-title {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #345bc7;
        }

        .lb-match-eyebrow {
          font-size: 11px;
          letter-spacing: 0.06em;
          font-weight: 800;
          color: #56709d;
        }

        .lb-match-result-title h4 {
          font-size: 22px;
          color: #1e3157;
          margin: 4px 0;
        }

        .lb-match-focus {
          font-size: 15px;
          font-weight: 700;
          color: #273e66;
          margin: 18px 0 6px;
        }

        .lb-match-emphasis {
          font-size: 13px;
          color: #61738e;
          margin: 0 0 15px;
        }

        .lb-match-warning {
          background: #fff8e9;
          color: #75551f;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 12px;
        }

        .lb-match-cards {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .lb-match-cards > div {
          display: flex;
          flex-direction: column;
          gap: 8px;
          border: 1px solid #e1e8f8;
          border-radius: 12px;
          background: #fff;
          padding: 15px;
        }

        .lb-match-cards svg {
          color: #4469d7;
        }

        .lb-match-cards strong {
          font-size: 13px;
          color: #253858;
        }

        .lb-match-cards p {
          margin: 0;
          font-size: 12px;
          color: #64748f;
          line-height: 1.6;
        }

        .lb-match-conversion {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 18px;
          margin-top: 19px;
          padding-top: 18px;
          border-top: 1px solid #dbe5fa;
        }

        .lb-match-conversion > div:first-child {
          max-width: 430px;
        }

        .lb-match-conversion > div:first-child > span {
          display: block;
          color: #5d6d88;
          font-size: 12px;
          font-weight: 700;
        }

        .lb-match-conversion strong {
          display: block;
          color: #213a70;
          font-size: 30px;
          margin: 4px 0;
        }

        .lb-match-conversion strong small {
          font-size: 13px;
          color: #60738f;
        }

        .lb-match-conversion p {
          color: #64748f;
          font-size: 11px;
          margin: 4px 0;
          line-height: 1.5;
        }

        .lb-match-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: stretch;
        }

        .lb-match-actions .button {
          justify-content: center;
        }

        .lb-match-copy {
          display: inline-flex;
          gap: 8px;
          align-items: center;
          justify-content: center;
          padding: 11px 13px;
          background: white;
          border: 1px solid #a9bff1;
          border-radius: 9px;
          color: #345bc7;
          font-weight: 800;
          font-size: 12px;
        }

        .lb-match-preview {
          margin-top: 15px;
          font-size: 12px;
          color: #5d6f89;
        }

        .lb-match-preview summary {
          cursor: pointer;
        }

        .lb-match-preview pre {
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          background: white;
          border-radius: 8px;
          padding: 12px;
          line-height: 1.6;
          font-family: inherit;
        }

        .lb-match-fineprint {
          font-size: 11px;
          color: #7b8ba2;
          line-height: 1.6;
          margin: 17px 0 0;
        }

        @media (max-width: 700px) {
          .lb-match {
            padding: 18px;
          }

          .lb-match-top h3 {
            font-size: 22px;
          }

          .lb-match-form,
          .lb-match-cards {
            grid-template-columns: 1fr;
          }

          .lb-match-conversion {
            align-items: stretch;
          }

          .lb-match-actions {
            width: 100%;
          }

          .lb-match-submit {
            justify-self: stretch;
          }
        }
      `}</style>
    </section>
  );
}
