
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
      body: `Subject: Welcome to LessonBilly\n\nHello,\n\nPlease open ${site}, choose Portal Login, then Create Parent Account on the right. Register with the email address you provided to me, verify your email, and sign back in.\n\nI will connect your account to your student's record. You will then be able to select each of their classes to view published grades, feedback, and upcoming lesson links.\n\nThank you,\nLessonBilly`
    },
    {
      id: "student",
      title: "Student welcome message",
      body: `Subject: Your LessonBilly learning portal\n\nHello,\n\nWith your parent or guardian, visit ${site}, select Portal Login, then Create Student Account on the left. Verify your email and sign back in.\n\nI will link your account to your student record. After that, you can select your classes to see published scores and tutoring meeting links.\n\nStudent accounts for children under 13 should not be created until the required parental notice and consent process has been completed. Parents can use their own accounts in the meantime.\n\nThank you,\nLessonBilly`
    },
    {
      id: "grade",
      title: "New grade message",
      body: `Subject: LessonBilly - New grade available\n\nHello,\n\nA new assessment has been published in LessonBilly. Sign in at ${site}, select the student's class, and open Grade history to see the score and feedback.\n\nThank you,\nLessonBilly`
    }
  ];

  async function copyMessage(item) {
    try {
      await navigator.clipboard.writeText(item.body);
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
        <BookOpenCheck size={23} color="#466cde" />
        Tutor Guide - How to use LessonBilly
      </h2>

      <p className="muted">
        Open a section for instructions. The guide is
        visible only in your tutor dashboard.
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
              the parent's registered email, grade level,
              and first class (such as Math).
            </li>

            <li>
              Optionally link an approved, verified
              student account now or afterward in
              Student account access.
            </li>

            <li>
              Have the parent and student sign in
              separately to check that they see only
              their assigned records.
            </li>
          </ol>

          <p className="lb-guide-note">
            <ShieldCheck size={15} /> For children
            under 13, don't invite independent
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
              Change Student grade level (for example,
              Grade 8 to Grade 9).
            </li>

            <li>
              Click Save grade level. Their existing
              classes and grades will remain intact.
            </li>
          </ol>
        </div>
      </details>

      <details>
        <summary>
          3. Add another class, rename a class, or switch classes
        </summary>

        <div className="lb-guide-body">
          <ol>
            <li>
              Select a student under Your students.
            </li>

            <li>
              In Student details and classes, type the
              new subject in Add another class and click
              Add class.
            </li>

            <li>
              Use the class buttons to switch between
              subjects such as Math and English.
            </li>

            <li>
              To change the selected class name, edit
              Rename selected class and click Rename class.
            </li>

            <li>
              Grades and scheduled lessons below belong
              to whichever class is selected. Parents
              and students can switch classes from their
              own dashboards too.
            </li>
          </ol>

          <p className="muted tiny">
            Older student records are displayed as one
            original class automatically. This update
            does not delete old assessments.
          </p>
        </div>
      </details>

      <details>
        <summary>
          4. Save and publish a class assessment
        </summary>

        <div className="lb-guide-body">
          <ol>
            <li>
              Select the student and then the correct class.
            </li>

            <li>
              In Add an assessment, enter the title,
              points earned, possible points, and
              optional feedback.
            </li>

            <li>
              Click Save draft grade. Only you can see
              a draft.
            </li>

            <li>
              Check the score, then click Publish in
              the selected class's assessment history.
            </li>

            <li>
              Use Email parent or copy the grade message
              below to notify the family manually.
            </li>
          </ol>
        </div>
      </details>

      <details>
        <summary>
          5. Schedule each class's tutoring session
        </summary>

        <div className="lb-guide-body">
          <ol>
            <li>
              Select the student, then select the
              relevant class.
            </li>

            <li>
              Create a Google Meet link using your
              own account.
            </li>

            <li>
              Enter the Meet link, lesson date and
              time, and duration (1 to 3 hours).
            </li>

            <li>
              Click Save lesson. The link appears
              under that class for the linked parent
              and student.
            </li>
          </ol>

          <p className="muted tiny">
            LessonBilly does not record or automatically
            end Google Meet sessions. Obtain appropriate
            recording consent if you use separate
            recording software.
          </p>
        </div>
      </details>

      <details>
        <summary>
          6. Copy messages for parents and students
        </summary>

        <div className="lb-guide-body">
          {messages.map(item => (
            <div className="lb-message" key={item.id}>
              <div className="lb-message-head">
                <strong>{item.title}</strong>

                <button
                  className="lb-copy"
                  type="button"
                  onClick={() => copyMessage(item)}
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
              Clipboard unavailable. Select and copy
              the message manually.
            </p>
          )}
        </div>
      </details>

      <details>
        <summary>
          7. Fix account-linking and permission errors
        </summary>

        <div className="lb-guide-body">
          <ol>
            <li>
              If a student profile cannot be found,
              confirm they used Student Sign In,
              verified their email, and have a Firestore
              profiles document with role set to student.
            </li>

            <li>
              If a parent account cannot be found,
              confirm the parent registered, verified
              their email, and used the same email you
              entered.
            </li>

            <li>
              If an account cannot see a grade, confirm
              that you linked the correct account,
              selected the correct class, and clicked
              Publish.
            </li>

            <li>
              If Firebase denies access, check your
              published Firestore rules and confirm
              the full tutor UID matches the value
              in firebase.js.
            </li>
          </ol>
        </div>
      </details>
    </section>
  );
}
