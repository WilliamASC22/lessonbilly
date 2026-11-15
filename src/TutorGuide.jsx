
import { useState } from "react";
import {
  BookOpenCheck,
  CheckCircle2,
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

Go to ${site} and choose Portal Login, then Create Parent Account on the right. Verify your email and sign in.

I will link your account to your learner's record. You'll be able to see published grades, lessons, shared PDFs, and tutor-approved practice questions.

Thank you,
LessonBilly`
    },
    {
      id: "student",
      title: "Student welcome email",
      body: `Subject: LessonBilly student portal

Hello,

With a parent or guardian, visit ${site}, select Portal Login and Create Student Account on the left, verify your email, and sign in. I'll link the account to your class.

You can then view published grades, assignments, class meetings, and Practice Center exercises.

Important: For children under 13, registration requires an appropriate parental notice and consent process first.

Thank you,
LessonBilly`
    },
    {
      id: "practice",
      title: "New practice activity notification",
      body: `Subject: New LessonBilly practice activities

Hello,

I published new flashcards and quiz questions in LessonBilly. Visit ${site}, sign in, and open Practice Center. Select your class and try the activities. Practice answers are not recorded or graded.

Thank you,
LessonBilly`
    }
  ];

  const steps = [
    {
      title: "1. Enroll and connect a family",
      instructions: [
        "Ask the parent to create and verify a Parent Account.",
        "Add the student in Dashboard with their grade level, class, and registered parent email.",
        "Optionally connect an approved student account using Student account access.",
        "Test both accounts with fictional data before real use."
      ]
    },
    {
      title: "2. Manage classes and grades",
      instructions: [
        "Select a student, update grade level, and add or rename classes as needed.",
        "Choose a class before entering grades or a meeting link.",
        "Save an assessment as Draft, verify its score, then Publish to the family.",
        "To permanently remove a class, use Delete class below its Google Drive links. The confirmation requires typing its name; deleting its last class is blocked."
      ]
    },
    {
      title: "3. Share Google Drive PDFs",
      instructions: [
        "Upload homework and classwork PDFs in your Google Drive account.",
        "Share each file with the correct parent/student Google accounts as Viewer using Restricted access.",
        "Copy the file link into the correct class in LessonBilly.",
        "Replacing or removing a link from LessonBilly does not delete or unshare the file in Google Drive. Clean up Drive manually."
      ]
    },
    {
      title: "4. Create tutor-approved practice",
      instructions: [
        "Open Practice Center from the top navigation, and choose the student and class.",
        "Paste lesson notes or upload a text-based PDF from your device. Scanned pages cannot be read automatically.",
        "Click Generate draft activities locally, or start with blank templates if WebGPU/AI isn't available.",
        "Review and edit all 10 flashcards, 10 quiz questions, and answer keys. The AI is fallible.",
        "Click Publish once satisfied. Approved activities remain available; unpublished drafts disappear when you reload.",
        "Student quiz attempts, flashcard progress and scores are not stored. A refresh resets them."
      ]
    },
    {
      title: "5. Schedule lessons",
      instructions: [
        "Select the student and class.",
        "Create a Google Meet link and enter it with the lesson date and duration.",
        "Save lesson, then tell the family to use the Join Google Meet button in their dashboard."
      ]
    },
    {
      title: "6. Troubleshoot",
      instructions: [
        "Missing student profile: check registration, email verification, and the Firestore profile role.",
        "Permission denied: make sure tutor UID in firebase.js and published Firestore rules match.",
        "PDF link denied: verify Google Drive sharing with the exact invited Google account.",
        "Practice Center missing: confirm the new practice security rule was published and that the tutor published the activity set.",
        "AI not loading: use a current WebGPU-compatible device or build exercises with blank drafts."
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
        Expand any section for step-by-step
        instructions and family messages.
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
          7. Copy emails to parents and students
        </summary>

        {messages.map(item => (
          <div
            className="lb-message"
            key={item.id}
          >
            <div className="lb-message-top">
              <strong>{item.title}</strong>

              <button
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
            Clipboard unavailable; select and
            copy the text instead.
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
        Protect real student records and complete
        applicable parental consent requirements
        before use.
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
