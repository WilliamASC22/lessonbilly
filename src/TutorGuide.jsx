
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

Please open ${site}, choose Portal Login, then Create Parent Account on the right. Register with the email address you provided to me, verify your email, and sign back in.

I will connect your account to your student's record. You will then be able to select each of their classes to view published grades, feedback, upcoming lesson links, and Google Drive class PDFs.

Thank you,
LessonBilly`
    },
    {
      id: "student",
      title: "Student welcome message",
      body: `Subject: Your LessonBilly learning portal

Hello,

With your parent or guardian, visit ${site}, select Portal Login, then Create Student Account on the left. Verify your email and sign back in.

I will link your account to your student record. After that, you can select your classes to see published scores, tutoring meeting links, and shared Google Drive PDFs.

Student accounts for children under 13 should not be created until the required parental notice and consent process has been completed. Parents can use their own accounts in the meantime.

Thank you,
LessonBilly`
    },
    {
      id: "grade",
      title: "New grade message",
      body: `Subject: LessonBilly - New grade available

Hello,

A new assessment has been published in LessonBilly. Sign in at ${site}, select the student's class, and open Grade history to see the score and feedback.

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

        .lb-guide li:last-child {
          margin-bottom: 0;
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

        .lb-guide .lb-message:last-child {
          border: 0;
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
        Open a section for instructions.
        The guide is visible only in your tutor dashboard.
      </p>

      <details>
        <summary>
          1. Enroll a student and connect their accounts
        </summary>

        <div className="lb-guide-body">
          <ol>
            <li>
              Ask a parent to create a Parent Account
              and verify their email.
            </li>
            <li>
              In Add a student, enter the student's name,
              parent's registered email, grade level,
              and first class.
            </li>
            <li>
              Optionally link an approved, verified
              student account in Student account access.
            </li>
            <li>
              Have the parent and student sign in
              separately to verify their assigned records.
            </li>
          </ol>

          <p className="lb-guide-note">
            <ShieldCheck size={15} />
            For children under 13, don't invite independent
            registration without the required parental
            notice and consent process. A checkbox alone
            does not establish consent.
          </p>
        </div>
      </details>

      <details>
        <summary>
          2. Update a student's grade level
        </summary>

        <div className="lb-guide-body">
          <ol>
            <li>
              Under Your students, select the student.
            </li>
            <li>
              Open Student details and classes.
            </li>
            <li>
              Change Student grade level.
            </li>
            <li>
              Click Save grade level. Existing classes
              and grades are preserved.
            </li>
          </ol>
        </div>
      </details>

      <details>
        <summary>
          3. Add, rename, or switch classes
        </summary>

        <div className="lb-guide-body">
          <ol>
            <li>Select the student.</li>
            <li>
              Type a new subject in Add another class
              and click Add class.
            </li>
            <li>
              Use the class buttons to switch between
              subjects such as Math and English.
            </li>
            <li>
              To rename a class, edit Rename selected
              class and click Rename class.
            </li>
            <li>
              Grades, scheduled lessons, and PDF links
              belong to whichever class is selected.
            </li>
          </ol>
        </div>
      </details>

      <details>
        <summary>
          4. Save and publish assessments
        </summary>

        <div className="lb-guide-body">
          <ol>
            <li>Select the student and correct class.</li>
            <li>
              Enter assessment title, earned points,
              possible points, and optional feedback.
            </li>
            <li>Click Save draft grade.</li>
            <li>
              Click Publish in assessment history when
              the result is ready for the family.
            </li>
            <li>
              Use Email parent to notify the family manually.
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
            <li>Select the student and class.</li>
            <li>Create a Google Meet link.</li>
            <li>
              Enter the link, date, time, and lesson duration.
            </li>
            <li>
              Click Save lesson. The family will see
              the meeting details under that class.
            </li>
          </ol>

          <p className="muted tiny">
            LessonBilly doesn't record or automatically
            end Google Meet sessions.
          </p>
        </div>
      </details>

      <details>
        <summary>
          6. Share homework and classwork PDFs using Google Drive
        </summary>

        <div className="lb-guide-body">
          <ol>
            <li>
              Upload the PDF to your own Google Drive account.
            </li>
            <li>
              Right-click the PDF, select Share,
              and keep General access set to Restricted.
            </li>
            <li>
              Add the student's and parent's Google Account
              email addresses as Viewers. They may use
              a different email from their LessonBilly account.
            </li>
            <li>
              Click Copy link in Google Drive.
            </li>
            <li>
              Back in LessonBilly, select the student and
              class, paste the link into Homework PDF
              or Classwork PDF, and click Save link.
            </li>
            <li>
              To replace a PDF, upload a new file to Drive,
              share it with the family, and save the
              replacement link.
            </li>
            <li>
              To remove a PDF, click Remove link in
              LessonBilly and separately delete the old
              file or revoke its sharing in Google Drive.
            </li>
          </ol>

          <p className="lb-guide-note">
            <ShieldCheck size={15} />
            Do not choose Anyone with the link for private
            student materials. LessonBilly controls who can
            see the link, but Google Drive controls who can
            open the file.
          </p>

          <p className="muted tiny">
            Only the tutor can save or remove links in
            LessonBilly. Students and parents can open
            the files but cannot edit the saved links.
          </p>
        </div>
      </details>

      <details>
        <summary>
          7. Copy messages for parents and students
        </summary>

        <div className="lb-guide-body">
          {messages.map(item => (
            <div
              className="lb-message"
              key={item.id}
            >
              <div className="lb-message-head">
                <strong>{item.title}</strong>

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
              Select and copy the message manually.
            </p>
          )}
        </div>
      </details>

      <details>
        <summary>
          8. Fix account-linking, PDF access, and permission errors
        </summary>

        <div className="lb-guide-body">
          <ol>
            <li>
              If a student profile cannot be found,
              confirm they registered through Student
              Sign In, verified their email, and have
              a Firestore profile with role set to student.
            </li>
            <li>
              If a parent profile cannot be found,
              verify their registration and registered email.
            </li>
            <li>
              If a grade is missing, check the linked
              account, selected class, and Publish status.
            </li>
            <li>
              If a PDF link opens Access denied,
              confirm the correct Google Account was
              invited as a Viewer in Google Drive.
              LessonBilly sign-in does not grant Google
              Drive permission automatically.
            </li>
            <li>
              If a PDF is outdated, replace its link
              in LessonBilly and remove access to the
              old file in Drive.
            </li>
            <li>
              If Firebase denies access, check your
              published Firestore rules and the full
              tutor UID in firebase.js.
            </li>
          </ol>
        </div>
      </details>
    </section>
  );
}
