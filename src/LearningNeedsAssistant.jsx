
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCopy,
  Sparkles
} from "lucide-react";

import {
  AREA_LABELS,
  predictLearningArea,
  makeStarterPlan,
  formatPlan
} from "./learningClassifier.js";

const EMAIL = import.meta.env.VITE_CONTACT_EMAIL;
const AREA_OPTIONS = Object.entries(AREA_LABELS);

export default function LearningNeedsAssistant() {
  const [grade, setGrade] = useState("Grade 8");
  const [challenge, setChallenge] = useState("");
  const [area, setArea] = useState("auto");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  function createPlan(event) {
    event.preventDefault();

    const description = challenge
      .trim()
      .slice(0, 400);

    if (description.length < 10) return;

    const prediction =
      predictLearningArea(description);

    const selected =
      area === "auto"
        ? prediction.area
        : area;

    setResult({
      plan: makeStarterPlan({
        area: selected,
        gradeLevel: grade,
        challenge: description
      }),
      prediction:
        area === "auto" ? prediction : null
    });

    setCopied(false);
  }

  async function copyPlan() {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(
        formatPlan(result.plan)
      );
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const requestBody = result
    ? `${formatPlan(result.plan)}\n\nI'd like to ask about online tutoring availability.`
    : "";

  return (
    <section
      className="lb-needs"
      aria-labelledby="lb-needs-title"
    >
      <div className="lb-needs-heading">
        <span className="lb-needs-symbol">
          <Sparkles size={21} />
        </span>

        <div>
          <span className="section-kicker">
            FREE INTERACTIVE TOOL
          </span>

          <h3 id="lb-needs-title">
            Find your starting point
          </h3>

          <p>
            Describe a learning challenge to get
            a practical two-session tutoring
            starter plan.
          </p>
        </div>
      </div>

      <form
        className="lb-needs-form"
        onSubmit={createPlan}
      >
        <label>
          Student's grade

          <select
            value={grade}
            onChange={e =>
              setGrade(e.target.value)
            }
          >
            <option value="Kindergarten">
              Kindergarten
            </option>

            {Array.from(
              { length: 12 },
              (_, index) => (
                <option
                  key={index + 1}
                  value={`Grade ${index + 1}`}
                >
                  Grade {index + 1}
                </option>
              )
            )}
          </select>
        </label>

        <label>
          Subject (optional)

          <select
            value={area}
            onChange={e =>
              setArea(e.target.value)
            }
          >
            <option value="auto">
              Suggest from description
            </option>

            {AREA_OPTIONS.map(
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

        <label className="lb-needs-full">
          What is the student finding difficult?

          <textarea
            value={challenge}
            maxLength={400}
            rows={3}
            required
            minLength={10}
            placeholder="For example: My eighth grader understands multiplication but struggles with fractions and word problems."
            onChange={e =>
              setChallenge(e.target.value)
            }
          />
        </label>

        <button
          className="button"
          type="submit"
        >
          Create starter plan
          <ArrowRight size={17} />
        </button>
      </form>

      {result && (
        <div
          className="lb-needs-result"
          role="status"
        >
          <div className="lb-needs-result-head">
            <CheckCircle2 size={20} />

            <strong>
              Suggested focus:{" "}
              {result.plan.subject}
            </strong>
          </div>

          {result.prediction?.uncertain && (
            <p className="lb-needs-caution">
              The description could fit more
              than one subject. Choose a subject
              above if this suggestion isn't right.
            </p>
          )}

          <div className="lb-needs-steps">
            <div>
              <b>First session</b>
              <p>{result.plan.first}</p>
            </div>

            <div>
              <b>Second session</b>
              <p>{result.plan.second}</p>
            </div>

            <div>
              <b>Between lessons</b>
              <p>{result.plan.between}</p>
            </div>
          </div>

          <div className="lb-needs-actions">
            <button
              type="button"
              className="lb-needs-secondary"
              onClick={copyPlan}
            >
              <ClipboardCopy size={16} />
              {copied ? "Copied!" : "Copy plan"}
            </button>

            {EMAIL && (
              <a
                className="button"
                href={`mailto:${EMAIL}?subject=${encodeURIComponent(
                  "LessonBilly tutoring inquiry"
                )}&body=${encodeURIComponent(
                  requestBody
                )}`}
              >
                Ask about tutoring
                <ArrowRight size={16} />
              </a>
            )}
          </div>

          <details>
            <summary>
              View the full plan as text
            </summary>

            <pre>
              {formatPlan(result.plan)}
            </pre>
          </details>
        </div>
      )}

      <p className="lb-needs-disclaimer">
        This uses a small text-classification model,
        not a chatbot or academic diagnosis. It
        runs entirely in this browser; your description
        isn't sent to LessonBilly unless you choose
        to email it. No account is required.
      </p>

      <style>{`
        .lb-needs {
          max-width: 960px;
          margin: 30px auto 0;
          background: #fff;
          border: 1px solid #dfe7f7;
          border-radius: 20px;
          padding: 26px;
          box-shadow: 0 16px 35px #263f9e0b;
        }
        .lb-needs-heading {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .lb-needs-symbol {
          background: #eaf0ff;
          color: #4268db;
          padding: 12px;
          border-radius: 12px;
          display: flex;
        }
        .lb-needs-heading h3 {
          font-size: 25px;
          margin: 4px 0 6px;
          color: #1e3157;
        }
        .lb-needs-heading p {
          font-size: 14px;
          margin: 0;
          color: #65738a;
        }
        .lb-needs-form {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
          margin-top: 22px;
        }
        .lb-needs-form label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          font-size: 13px;
          color: #435777;
          font-weight: 800;
        }
        .lb-needs-full {
          grid-column: 1 / -1;
        }
        .lb-needs-form select,
        .lb-needs-form textarea {
          width: 100%;
          border-radius: 10px;
          border: 1px solid #d9e3f1;
          padding: 12px;
          font: inherit;
          color: #253858;
          background: white;
        }
        .lb-needs-form textarea {
          resize: vertical;
        }
        .lb-needs-form .button {
          justify-self: start;
        }
        .lb-needs-result {
          border: 1px solid #c8d8f5;
          background: #f6f9ff;
          border-radius: 14px;
          padding: 19px;
          margin-top: 21px;
        }
        .lb-needs-result-head {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #284fbd;
        }
        .lb-needs-steps {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 17px;
        }
        .lb-needs-steps > div {
          border: 1px solid #dee8fb;
          border-radius: 10px;
          padding: 14px;
          background: #fff;
        }
        .lb-needs-steps b {
          font-size: 13px;
          color: #1e3157;
        }
        .lb-needs-steps p {
          font-size: 13px;
          color: #5c6c87;
          line-height: 1.55;
          margin: 7px 0 0;
        }
        .lb-needs-caution {
          color: #76551d;
          font-size: 13px;
        }
        .lb-needs-actions {
          display: flex;
          align-items: center;
          gap: 11px;
          flex-wrap: wrap;
          margin-top: 17px;
        }
        .lb-needs-secondary {
          display: flex;
          align-items: center;
          gap: 7px;
          border: 1px solid #a9bff1;
          border-radius: 9px;
          padding: 12px 15px;
          color: #345bc7;
          background: #fff;
          font-weight: 800;
        }
        .lb-needs-result details {
          margin-top: 15px;
          color: #536480;
          font-size: 12px;
        }
        .lb-needs-result summary {
          cursor: pointer;
        }
        .lb-needs-result pre {
          white-space: pre-wrap;
          font-family: inherit;
          overflow-wrap: anywhere;
          line-height: 1.7;
          padding: 13px;
          background: #fff;
          border-radius: 9px;
        }
        .lb-needs-disclaimer {
          font-size: 12px;
          color: #687a96;
          line-height: 1.6;
          margin: 17px 0 0;
        }
        @media (max-width: 700px) {
          .lb-needs {
            padding: 18px;
          }
          .lb-needs-form,
          .lb-needs-steps {
            grid-template-columns: 1fr;
          }
          .lb-needs-heading h3 {
            font-size: 21px;
          }
        }
      `}</style>
    </section>
  );
}
