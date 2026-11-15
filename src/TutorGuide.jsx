
import { useState } from "react";
import {
  BookOpenCheck,
  Copy,
  ShieldCheck
} from "lucide-react";

export default function TutorGuide() {
  const [copied, setCopied] = useState("");
  const site = window.location.origin;

  const messages = [
    {
      id: "parent",
      title: "Parent welcome email",
      body: `Subject: Welcome to LessonBilly

Hello,

Visit ${site}, select Portal Login, create a Parent Account and verify your email. I will link your account to your student's record.

You can then see published grades, class PDFs, meeting links, and tutor-reviewed practice activities.

Thank you,
LessonBilly`
    },
    {
      id: "student",
      title: "Student welcome email",
      body: `Subject: Your LessonBilly learning portal

Hello,

With your parent or guardian, visit ${site}, choose Portal Login, create a Student Account and verify your email. I will link the account to your student record.

Once connected, you can open published grades, class materials, meeting links and Practice Center.

For children under 13, complete the required parental notice and consent process first.

Thank you,
LessonBilly`
    },
    {
      id: "practice",
      title: "New practice activity email",
      body: `Subject: New LessonBilly practice activities

Hello,

I have published new tutor-reviewed flashcards and quiz questions. Sign in at ${site}, open Practice Center and select your class.

Practice attempts are not saved or counted as grades.

Thank you,
LessonBilly`
    }
  ];

  const steps = [
    {
      title: "1. Enroll and connect a family",
      instructions: [
        "Ask the parent to create and verify a Parent Account.",
        "Add the student in Dashboard, using the parent's registered email.",
        "Optionally link an approved student account using Student account access.",
        "Test the account links using fictional records before real use."
      ]
    },
    {
      title: "2. Manage classes and grades",
      instructions: [
        "Select a student, edit their grade level, and add or rename classes.",
        "Select the appropriate class before saving grades or scheduling a lesson.",
        "Review each assessment and select Publish when the family should see it.",
        "Permanent class deletion uses a typed confirmation. The student's final class cannot be deleted with that button."
      ]
    },
    {
      title: "3. Share Homework and Classwork PDFs",
      instructions: [
        "Upload PDFs to your own Google Drive account.",
        "Set access to Restricted and invite the intended family Google accounts as Viewers.",
        "Save the correct file link under the student's corresponding class.",
        "If you replace or remove a link, delete or unshare the old Drive file separately."
      ]
    },
    {
      title: "4. Create practice without a large AI model",
      instructions: [
        "Open Practice Center and select the student and class.",
        "Paste explicit answer pairs, using Q: followed by A: on a separate line. CARD|question|answer and QUIZ|question|choice A|choice B|choice C|choice D|correct answer 1-4|explanation also work.",
        "You may upload a text-based PDF. For scanned or poorly formatted PDFs, paste or type the source text instead.",
        "Select Build drafts from answer pairs. The tool uses existing answers, not a language model, so it won't make up solutions.",
        "Check all 10 flashcards and 10 quiz questions. Automatically chosen incorrect choices may need editing.",
        "Publish only when every fact and answer key has been verified. Unpublished drafts disappear on reload."
      ]
    },
    {
      title: "5. Introduce AI Tutor Match to prospective families",
      instructions: [
        "On Home, scroll to the animated feature showcase and What kind of tutoring would help?",
        "A parent can select a grade and describe the main academic challenge without creating an account.",
        "The small local machine-learning classifier suggests a subject and shows how tutoring sessions would address the student's needs. Parents can override the subject.",
        "Families can preview and copy a structured inquiry or choose Request tutoring availability to open a prefilled email. The website does not automatically send or store the description.",
        "The tool supports prospective client intake; it does not diagnose learning difficulties, guarantee results, or replace a tutor."
      ]
    },
    {
      title: "6. Troubleshooting",
      instructions: [
        "Missing student profile: confirm the account was registered and its email verified.",
        "Permission denied: confirm the actual tutor UID matches published Firestore rules and firebase.js.",
        "Drive file access denied: verify which Google account was invited as Viewer.",
        "No practice drafts: format notes as Q: and A: pairs or fill the blank editors manually.",
        "Practice Center does not need WebGPU, an API key or a model download anymore."
      ]
    }
  ];

  async function copy(item) {
    try {
      await navigator.clipboard.writeText(item.body);
      setCopied(item.id);
    } catch {
      setCopied("error");
    }
  }

  return (
    <section
      className="panel lb-guide"
      style={{ marginBottom: 25 }}
    >
      <div className="panel-heading">
        <h2>
          <BookOpenCheck size={20} />
          Tutor Guide - How to use LessonBilly
        </h2>
      </div>

      <p className="muted tiny">
        Expand any section for instructions
        and copyable client messages.
      </p>

      {steps.map(step => (
        <details key={step.title}>
          <summary>{step.title}</summary>

          <ol>
            {step.instructions.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        </details>
      ))}

      <details>
        <summary>
          7. Copy messages for families
        </summary>

        {messages.map(item => (
          <div
            className="lb-message"
            key={item.id}
          >
            <div className="lb-message-top">
              <strong>{item.title}</strong>

              <button
                type="button"
                className="subtle-button"
                onClick={() => copy(item)}
              >
                <Copy size={15} />

                {copied === item.id
                  ? "Copied"
                  : "Copy message"}
              </button>
            </div>

            <pre>{item.body}</pre>
          </div>
        ))}

        {copied === "error" && (
          <p className="muted">
            Clipboard access was blocked.
            Select and copy the text manually.
          </p>
        )}
      </details>

      <p
        className="muted tiny"
        style={{ marginTop: 15 }}
      >
        <ShieldCheck
          size={15}
          style={{ verticalAlign: "middle" }}
        />
        Protect student records, limit Drive
        access and complete applicable parental
        consent requirements before real enrollment.
      </p>

      <style>{`
        .lb-guide details {
          border: 1px solid #e2eaf8;
          border-radius: 11px;
          overflow: hidden;
          margin-top: 10px;
        }

        .lb-guide summary {
          cursor: pointer;
          background: #f6f8ff;
          padding: 15px 17px;
          font-size: 13px;
          font-weight: 800;
          color: #294067;
        }

        .lb-guide ol {
          padding: 12px 24px 13px 42px;
          margin: 0;
        }

        .lb-guide li {
          color: #586a85;
          line-height: 1.65;
          font-size: 13px;
          margin: 8px 0;
        }

        .lb-message {
          padding: 14px 18px;
          border-top: 1px solid #edf1f8;
        }

        .lb-message-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 9px;
          flex-wrap: wrap;
        }

        .lb-message pre {
          padding: 12px;
          background: #f7f9fc;
          border-radius: 9px;
          font-size: 12px;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          line-height: 1.6;
          max-height: 200px;
          overflow: auto;
          font-family: inherit;
        }
      `}</style>
    </section>
  );
}
