
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
      title: "Parent welcome message",
      body: `Subject: Welcome to LessonBilly

Hello,

Please visit ${site}, choose Portal Login, then Create Parent Account on the right.

Register with the email address you provided to me and verify your email.

I will connect your account to your student's record. You can then view their classes, published grades, tutoring links, and shared PDFs.

Thank you,
LessonBilly`
    },
    {
      id: "student",
      title: "Student welcome message",
      body: `Subject: Your LessonBilly learning portal

Hello,

With your parent or guardian, visit ${site}, select Portal Login, then Create Student Account on the left.

Verify your email and sign back in.

I will link your account to your student record so you can see your classes, published scores, tutoring links, and homework materials.

For children under 13, student registration should not be used until the required parental notice and consent process is completed.

Thank you,
LessonBilly`
    },
    {
      id: "grade",
      title: "New grade message",
      body: `Subject: LessonBilly - New grade available

Hello,

A new assessment has been published in LessonBilly.

Please sign in at ${site}, select the student's class, and open Grade history to view the score and feedback.

Thank you,
LessonBilly`
    }
  ];

  async function copyMessage(item) {
    try {
      await navigator.clipboard.writeText(
        item.body
      );
      setCopied(item.id);
    } catch {
      setCopied("error");
    }
  }

  return (
    <section className="panel lb-guide">
      <style>{`
        .lb-guide {
          margin-bottom: 26px;
        }

        .lb-guide h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          margin: 0 0 10px;
        }

        .lb-guide details {
          border: 1px solid #e2e9f7;
          border-radius: 12px;
          margin-top: 11px;
          overflow: hidden;
        }

        .lb-guide summary {
          cursor: pointer;
          padding: 15px 17px;
          background: #f5f8ff;
          font-weight: 800;
          color: #24385f;
          font-size: 14px;
        }

        .lb-guide .lb-guide-body {
          padding: 17px 19px;
        }

        .lb-guide ol {
          margin: 0;
          padding-left: 22px;
        }

        .lb-guide li {
          margin-bottom: 9px;
          color: #536480;
          font-size: 14px;
          line-height: 1.65;
        }

        .lb-guide .lb-guide-note {
          background: #fff7e8;
          border-radius: 9px;
          padding: 12px;
          margin: 14px 0 0;
          font-size: 13px;
          color: #76551d;
        }

        .lb-guide .lb-copy {
          border: 1px solid #9db4f2;
          border-radius: 9px;
          background: #eef3ff;
          color: #345bc7;
          padding: 9px 12px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-weight: 800;
        }

        .lb-guide .lb-message {
          padding: 14px 0;
          border-bottom: 1px solid #e9edf5;
        }

        .lb-guide .lb-message-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .lb-guide pre {
          background: #f6f8fc;
          border-radius: 9px;
          padding: 13px;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          font-family: inherit;
          line-height: 1.6;
          font-size: 12px;
          max-height: 220px;
          overflow: auto;
          margin: 12px 0 0;
        }
      `}</style>

      <h2>
        <BookOpenCheck
          size={23}
          color="#466cde"
        />
        Tutor Guide - How to use LessonBilly
      </h2>

      <p className="muted">
        Expand a section for instructions.
        This guide is available in the tutor dashboard.
      </p>

      <details>
        <summary>
          1. Enroll a student and connect accounts
        </summary>

        <div className="lb-guide-body">
          <ol>
            <li>
              Ask the parent to register and verify
              their email.
            </li>
            <li>
              Add the student's name, registered parent
              email, grade level, and first subject.
            </li>
            <li>
              Optionally link an approved student
              account in Student account access.
            </li>
            <li>
              Have the family test their accounts.
            </li>
          </ol>

          <p className="lb-guide-note">
            <ShieldCheck size={15} />
            For children under 13, complete the
            necessary parental notice and consent
            process before independent registration.
          </p>
        </div>
      </details>

      <details>
        <summary>
          2. Update a student's grade level
        </summary>

        <div className="lb-guide-body">
          <ol>
            <li>Select the student.</li>
            <li>
              Open Student details and classes.
            </li>
            <li>
              Change the grade level.
            </li>
            <li>
              Click Save grade level.
            </li>
          </ol>
        </div>
      </details>

      <details>
        <summary>
          3. Add, rename, or delete classes
        </summary>

        <div className="lb-guide-body">
          <ol>
            <li>
              Select a student under Your students.
            </li>
            <li>
              Enter a subject in Add another class,
              then click Add class.
            </li>
            <li>
              Choose a class using its class button.
            </li>
            <li>
              To rename it, use Rename selected class.
            </li>
            <li>
              To delete it, scroll down to Homework
              and classwork PDFs. Find Remove student
              from this class.
            </li>
            <li>
              Click Delete class and its grades.
            </li>
            <li>
              Confirm the warning. Then type DELETE
              followed by the exact class name.
            </li>
            <li>
              The class and its assessments will be
              permanently deleted from Firestore.
              At least one class must remain.
            </li>
            <li>
              Delete or unshare old PDFs separately
              in Google Drive.
            </li>
          </ol>

          <p className="lb-guide-note">
            Deleting a class is permanent.
            The student's other classes and
            LessonBilly account remain intact.
          </p>
        </div>
      </details>

      <details>
        <summary>
          4. Save and publish assessments
        </summary>

        <div className="lb-guide-body">
          <ol>
            <li>
              Select the student and correct class.
            </li>
            <li>
              Enter assessment title, points,
              and optional feedback.
            </li>
            <li>
              Click Save draft grade.
            </li>
            <li>
              Click Publish when the grade is ready.
            </li>
            <li>
              Notify the parent manually.
            </li>
          </ol>
        </div>
      </details>

      <details>
        <summary>
          5. Schedule tutoring lessons
        </summary>

        <div className="lb-guide-body">
          <ol>
            <li>
              Select the student and class.
            </li>
            <li>
              Create a Google Meet link.
            </li>
            <li>
              Enter the meeting link, date, time,
              and duration.
            </li>
            <li>
              Click Save lesson.
            </li>
          </ol>
        </div>
      </details>

      <details>
        <summary>
          6. Share homework and classwork PDFs
        </summary>

        <div className="lb-guide-body">
          <ol>
            <li>
              Upload the PDF to Google Drive.
            </li>
            <li>
              Set sharing to Restricted.
            </li>
            <li>
              Add the family Google accounts
              as Viewers.
            </li>
            <li>
              Copy the Google Drive file link.
            </li>
            <li>
              In LessonBilly, select the student
              and class.
            </li>
            <li>
              Paste the link into Homework PDF
              or Classwork PDF.
            </li>
            <li>
              Click Save link.
            </li>
            <li>
              To replace materials, save a new link.
              Delete or unshare the old Google Drive
              file separately.
            </li>
          </ol>
        </div>
      </details>

      <details>
        <summary>
          7. Optional on-device AI study helper
        </summary>

        <div className="lb-guide-body">
          <ol>
            <li>
              Select a student and class.
            </li>
            <li>
              Scroll to On-device AI study helper.
            </li>
            <li>
              Click Start local AI.
            </li>
            <li>
              Allow the model to download to
              the browser.
            </li>
            <li>
              Ask short practice questions.
            </li>
            <li>
              Use Clear chat to clear the visible
              conversation.
            </li>
          </ol>

          <p className="lb-guide-note">
            The AI runs locally, so it does not use
            Cloudflare's daily AI quota. However,
            it requires a compatible device and
            may give incorrect answers. It cannot
            read PDFs or grade student work.
            Do not enter personal information.
          </p>
        </div>
      </details>

      <details>
        <summary>
          8. Copy messages for parents and students
        </summary>

        <div className="lb-guide-body">
          {messages.map(item => (
            <div
              className="lb-message"
              key={item.id}
            >
              <div className="lb-guide-message-head">
                <strong>
                  {item.title}
                </strong>

                <button
                  className="lb-copy"
                  type="button"
                  onClick={() =>
                    copyMessage(item)
                  }
                >
                  {copied === item.id ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <Copy size={16} />
                  )}

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
              Clipboard unavailable.
              Copy the message manually.
            </p>
          )}
        </div>
      </details>

      <details>
        <summary>
          9. Troubleshooting
        </summary>

        <div className="lb-guide-body">
          <ol>
            <li>
              If a student account is missing,
              check their registration and
              Firestore profile.
            </li>
            <li>
              If grades are missing, confirm
              the correct class and Publish status.
            </li>
            <li>
              If a PDF cannot open, check Google
              Drive Viewer permissions.
            </li>
            <li>
              If Firestore denies access, verify
              the published rules and tutor UID.
            </li>
            <li>
              If AI does not load, check WebGPU
              support and available device memory.
              Local AI is optional.
            </li>
          </ol>
        </div>
      </details>
    </section>
  );
}
