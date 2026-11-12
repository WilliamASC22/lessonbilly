
import { useState } from "react";
import {
  BookOpenCheck,
  CheckCircle2,
  ClipboardCopy,
  HelpCircle,
  Mail,
  ShieldCheck
} from "lucide-react";

export default function TutorGuide() {
  const [copied, setCopied] = useState("");
  const website = window.location.origin;

  const parentMessage = `Subject: Welcome to LessonBilly - Set up your parent account

Hello,

Welcome to LessonBilly! Please visit ${website} and follow these steps:

1. Click Portal Login.
2. Under Parent Sign In, click Create Parent Account.
3. Register with the email address you shared with me.
4. Open the Firebase verification email and verify your address.
5. Sign in through Parent Sign In.

Once I link your account to your child's record, you'll be able to see published grades, feedback, and upcoming lesson details. Please let me know once you've signed up.

Thank you,
LessonBilly`;

  const studentMessage = `Subject: LessonBilly - Student portal instructions

Hello,

With your parent or guardian's assistance and approval, please visit ${website}.

1. Click Portal Login.
2. Under Student Sign In, click Create Student Account.
3. Register using the student email address you provided to me.
4. Verify the email using the link in your inbox.
5. Return to Student Sign In and log in.

Your tutor will link your student account to your learning record. Once connected, you'll be able to see published grades, feedback, and lesson links.

Important: For children under 13, do not create a student account until LessonBilly has arranged the necessary parental notice and consent process. In the meantime, a parent can use their own account.

Thank you,
LessonBilly`;

  const gradeMessage = `Subject: LessonBilly - New assessment result available

Hello,

A new assessment result is available in LessonBilly. Please visit ${website}, select Portal Login, and sign in to view the published grade and feedback.

Please reach out if you have questions.

Thank you,
LessonBilly`;

  async function copyMessage(key, message) {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(key);
    } catch {
      setCopied("failed");
    }
  }

  const templates = [
    {
      key: "parent",
      title: "Parent onboarding email",
      body: parentMessage
    },
    {
      key: "student",
      title: "Student onboarding email",
      body: studentMessage
    },
    {
      key: "grades",
      title: "Published grade notification",
      body: gradeMessage
    }
  ];

  return (
    <section
      className="panel lb-tutor-guide"
      aria-label="Tutor instructions"
    >
      <style>{`
        .lb-tutor-guide {
          margin-bottom: 26px;
        }

        .lb-tutor-guide h2 {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 20px;
          margin: 0 0 8px;
        }

        .lb-tutor-guide .lb-guide-intro {
          font-size: 14px;
          margin-bottom: 14px;
        }

        .lb-tutor-guide details {
          border: 1px solid #e3e9f6;
          border-radius: 12px;
          margin: 12px 0;
          overflow: hidden;
          background: #fff;
        }

        .lb-tutor-guide summary {
          cursor: pointer;
          padding: 15px 17px;
          font-size: 14px;
          font-weight: 800;
          color: #24385f;
          background: #f7f9ff;
        }

        .lb-tutor-guide .lb-guide-content {
          padding: 16px 19px 18px;
        }

        .lb-tutor-guide ol {
          margin: 0;
          padding-left: 23px;
        }

        .lb-tutor-guide li {
          margin: 9px 0;
          line-height: 1.6;
          font-size: 14px;
          color: #4b5e7b;
        }

        .lb-tutor-guide li strong {
          color: #213250;
        }

        .lb-tutor-guide .lb-guide-help {
          margin: 13px 0 0;
          font-size: 13px;
          line-height: 1.65;
          color: #596b85;
        }

        .lb-tutor-guide .lb-guide-warning {
          background: #fff7e8;
          border: 1px solid #f1dfb8;
          padding: 12px;
          border-radius: 9px;
        }

        .lb-tutor-guide .lb-template {
          padding: 12px 0;
          border-top: 1px solid #eef1f7;
        }

        .lb-tutor-guide .lb-template:first-child {
          border-top: none;
          padding-top: 0;
        }

        .lb-tutor-guide .lb-template-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .lb-tutor-guide .lb-template strong {
          font-size: 14px;
        }

        .lb-tutor-guide .lb-template pre {
          padding: 12px;
          max-height: 190px;
          overflow: auto;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          background: #f7f9fc;
          border-radius: 9px;
          font-size: 12px;
          line-height: 1.6;
          font-family: inherit;
          margin: 11px 0 0;
        }

        .lb-tutor-guide .lb-copy {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 12px;
          border: 1px solid #bdcdf9;
          border-radius: 9px;
          background: #ebf1ff;
          color: #345ed3;
          font-size: 12px;
          font-weight: 800;
        }
      `}</style>

      <h2>
        <BookOpenCheck size={22} color="#466cde" />
        Tutor Guide - How to use LessonBilly
      </h2>

      <p className="lb-guide-intro">
        Step-by-step instructions for enrolling families,
        linking student accounts, publishing grades, and
        scheduling lessons. Expand a section when you need it.
      </p>

      <details>
        <summary>1. Enroll a new family</summary>

        <div className="lb-guide-content">
          <ol>
            <li>
              <strong>Ask the parent to register first.</strong>{" "}
              Send the parent onboarding email below. They
              select Portal Login, then Parent Sign In,
              create an account, and verify their email.
            </li>

            <li>
              <strong>Confirm the registered email.</strong>{" "}
              In your tutor dashboard, the parent's email
              must match their LessonBilly account email.
              An account must have a Firestore profile to
              appear in the Registered accounts count.
            </li>

            <li>
              <strong>Add the learner.</strong>{" "}
              In Add a student, enter the student's name,
              the parent's registered email, grade level,
              and subject, then click Add student.
            </li>

            <li>
              <strong>Student login is optional.</strong>{" "}
              If a student account has been appropriately
              created and verified, enter their registered
              email when adding the student or link it
              afterward under Student account access.
            </li>

            <li>
              <strong>Test access.</strong>{" "}
              Have the parent log in. The family should
              see only the student's assigned record;
              published grades appear after you publish them.
            </li>
          </ol>

          <p className="lb-guide-help lb-guide-warning">
            <ShieldCheck
              size={15}
              style={{ verticalAlign: "middle" }}
            />{" "}
            For children under 13, do not invite independent
            student registration until the necessary parental
            notice and consent process exists. A checkbox
            alone is not sufficient. Parent accounts can
            be used in the meantime.
          </p>
        </div>
      </details>

      <details>
        <summary>
          2. Link a student login to an existing student record
        </summary>

        <div className="lb-guide-content">
          <ol>
            <li>
              Ask the student and guardian to complete the
              approved student registration process and
              verify the email.
            </li>

            <li>
              Under <strong>Your students</strong>, click
              the correct student's name.
            </li>

            <li>
              Open <strong>Student account access</strong>,
              enter the student's exact registered email,
              and click <strong>Save student access</strong>.
            </li>

            <li>
              Ask the student to sign in through{" "}
              <strong>Student Sign In</strong> and verify
              that their published grades and lesson
              details appear.
            </li>
          </ol>

          <p className="lb-guide-help">
            Do not type another student's email into this
            field. Leaving it empty and clicking Save
            student access unlinks the existing student login.
          </p>
        </div>
      </details>

      <details>
        <summary>
          3. Publish assessment results and notify families
        </summary>

        <div className="lb-guide-content">
          <ol>
            <li>
              Select the correct student.
            </li>

            <li>
              Under <strong>Add an assessment</strong>,
              enter the assessment name, points earned,
              total possible points, and optional feedback.
            </li>

            <li>
              Click <strong>Save draft grade</strong>.
              Drafts are visible only to the tutor.
            </li>

            <li>
              Check the details, then click{" "}
              <strong>Publish</strong> in Assessment
              history. Published scores appear in linked
              student and parent dashboards.
            </li>

            <li>
              Click <strong>Email parent</strong> or use
              the message template below.{" "}
              <strong>
                LessonBilly does not send grade
                notifications automatically.
              </strong>
            </li>
          </ol>
        </div>
      </details>

      <details>
        <summary>
          4. Schedule a lesson and share the meeting link
        </summary>

        <div className="lb-guide-content">
          <ol>
            <li>
              Create a Google Meet meeting using your
              own Google account.
            </li>

            <li>
              Select the learner in your tutor dashboard.
            </li>

            <li>
              In <strong>Upcoming lesson</strong>, paste
              the Meet URL, select the date/time and lesson
              duration (1 to 3 hours), then click{" "}
              <strong>Save lesson</strong>.
            </li>

            <li>
              Tell the family to open LessonBilly and
              select <strong>Join Google Meet</strong>{" "}
              from their dashboard when it's time for
              the lesson.
            </li>

            <li>
              Record separately using OBS only after
              securing appropriate permission. LessonBilly
              does not store video recordings or control
              the Google Meet call length.
            </li>
          </ol>
        </div>
      </details>

      <details>
        <summary>
          5. Messages you can copy and send to clients
        </summary>

        <div className="lb-guide-content">
          {templates.map(template => (
            <div
              className="lb-template"
              key={template.key}
            >
              <div className="lb-template-top">
                <strong>
                  <Mail
                    size={15}
                    style={{ verticalAlign: "middle" }}
                  />{" "}
                  {template.title}
                </strong>

                <button
                  className="lb-copy"
                  type="button"
                  onClick={() =>
                    copyMessage(
                      template.key,
                      template.body
                    )
                  }
                >
                  {copied === template.key ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <ClipboardCopy size={16} />
                  )}

                  {copied === template.key
                    ? "Copied"
                    : "Copy message"}
                </button>
              </div>

              <pre>{template.body}</pre>
            </div>
          ))}

          {copied === "failed" && (
            <p className="lb-guide-help">
              Clipboard access was blocked. You can select
              and copy the message text manually.
            </p>
          )}
        </div>
      </details>

      <details>
        <summary>
          6. Fix common account and linking problems
        </summary>

        <div className="lb-guide-content">
          <ol>
            <li>
              <strong>
                "No student profile found with that email":
              </strong>{" "}
              Confirm that the student registered through
              Student Sign In and verified their email.
              Then check Firebase Console &gt; Firestore
              &gt; Data &gt; profiles for a document with
              their Firebase Authentication UID and{" "}
              <code>role: "student"</code>.
            </li>

            <li>
              <strong>
                Account is verified but no profile exists:
              </strong>{" "}
              This can happen if registration was attempted
              while old Firestore rules were published.
              Repair the test account profile with the
              exact UID and role before linking; do not
              loosen security rules.
            </li>

            <li>
              <strong>Parent account not found:</strong>{" "}
              The parent must first register, verify
              their email, and have a matching profile.
              Use the same email in Add a student.
            </li>

            <li>
              <strong>Student sees no grades:</strong>{" "}
              Confirm you linked the correct student
              account and clicked Publish for the
              assessment. Draft grades are hidden.
            </li>

            <li>
              <strong>Firebase permission denied:</strong>{" "}
              Check that the latest{" "}
              <code>firestore.rules</code> were published
              in Firebase and that the tutor UID matches
              your actual Firebase account UID.
            </li>
          </ol>

          <p className="lb-guide-help">
            <HelpCircle
              size={15}
              style={{ verticalAlign: "middle" }}
            />{" "}
            Test using fictional accounts before entering
            real children's names, grades, or meeting details.
          </p>
        </div>
      </details>
    </section>
  );
}
