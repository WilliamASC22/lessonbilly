
import { useEffect, useState } from "react";
import { doc, runTransaction } from "firebase/firestore";
import {
  BookOpen,
  ExternalLink,
  Link2,
  Save,
  Trash2
} from "lucide-react";
import { db } from "./firebase";

const SLOTS = [
  { key: "homeworkDriveUrl", label: "Homework PDF" },
  { key: "classworkDriveUrl", label: "Classwork PDF" }
];

function normalizeGoogleDriveLink(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  let url;

  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(
      "Paste a valid Google Drive PDF sharing link."
    );
  }

  if (
    url.protocol !== "https:" ||
    url.hostname !== "drive.google.com"
  ) {
    throw new Error(
      "Only HTTPS Google Drive file links are allowed."
    );
  }

  const match = url.pathname.match(
    /^\/file\/d\/([A-Za-z0-9_-]{10,})(?:\/|$)/
  );

  const id =
    match?.[1] ||
    (url.pathname === "/open"
      ? url.searchParams.get("id")
      : "");

  if (
    !id ||
    !/^[A-Za-z0-9_-]{10,}$/.test(id)
  ) {
    throw new Error(
      "Use a Google Drive file sharing link, not a folder link."
    );
  }

  return `https://drive.google.com/file/d/${id}/view`;
}

export default function DriveMaterials({
  studentId,
  currentClass,
  canEdit = false
}) {
  const [drafts, setDrafts] = useState({
    homeworkDriveUrl: "",
    classworkDriveUrl: ""
  });

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setDrafts({
      homeworkDriveUrl:
        currentClass?.homeworkDriveUrl || "",
      classworkDriveUrl:
        currentClass?.classworkDriveUrl || ""
    });

    setMessage("");
    setError("");
  }, [
    studentId,
    currentClass?.id,
    currentClass?.homeworkDriveUrl,
    currentClass?.classworkDriveUrl
  ]);

  async function saveLink(key, clear = false) {
    if (
      !canEdit ||
      !studentId ||
      !currentClass?.id
    ) {
      return;
    }

    if (
      clear &&
      !window.confirm(
        "Remove this link from LessonBilly? This will not delete or unshare the PDF in Google Drive."
      )
    ) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const newUrl = clear
        ? ""
        : normalizeGoogleDriveLink(drafts[key]);

      const ref = doc(
        db,
        "students",
        studentId
      );

      await runTransaction(
        db,
        async transaction => {
          const snap =
            await transaction.get(ref);

          if (!snap.exists()) {
            throw new Error(
              "Student record not found."
            );
          }

          const student = snap.data();

          const list =
            Array.isArray(student.classes) &&
            student.classes.length
              ? student.classes
              : [
                  {
                    id: "original",
                    name:
                      student.subject ||
                      "General tutoring",
                    meetingUrl:
                      student.meetingUrl || "",
                    nextLessonAt:
                      student.nextLessonAt || "",
                    durationMinutes:
                      student.durationMinutes || 60
                  }
                ];

          if (
            !list.some(
              c => c.id === currentClass.id
            )
          ) {
            throw new Error(
              "This class no longer exists. Refresh the dashboard."
            );
          }

          transaction.update(ref, {
            classes: list.map(c =>
              c.id === currentClass.id
                ? {
                    ...c,
                    [key]: newUrl
                  }
                : c
            )
          });
        }
      );

      setMessage(
        clear
          ? "Link removed from LessonBilly. Manage the PDF's access separately in Google Drive."
          : "Google Drive link saved for this class."
      );
    } catch (e) {
      setError(
        e?.message ||
          "Could not update the link."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel lb-drive-materials">
      <style>{`
        .lb-drive-materials {
          margin-top: 24px;
        }

        .lb-drive-materials h2 {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 19px;
          margin: 0 0 8px;
        }

        .lb-drive-materials .lb-drive-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 18px;
        }

        .lb-drive-materials .lb-drive-slot {
          border: 1px solid #e2e9f7;
          border-radius: 13px;
          padding: 18px;
          min-width: 0;
        }

        .lb-drive-materials .lb-drive-slot h3 {
          font-size: 15px;
          margin: 0 0 11px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .lb-drive-materials .lb-drive-input {
          display: block;
          width: 100%;
          border: 1px solid #dce4f1;
          border-radius: 9px;
          padding: 11px;
          font-size: 13px;
          margin: 10px 0;
        }

        .lb-drive-materials .lb-drive-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 12px;
        }

        .lb-drive-materials .lb-drive-button {
          border: 1px solid #c9d6f5;
          background: #ecf2ff;
          color: #345ac0;
          padding: 9px 12px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }

        .lb-drive-materials .lb-drive-button.danger {
          background: #fff2f2;
          color: #ac4242;
          border-color: #f0cbcb;
        }

        .lb-drive-materials .lb-drive-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .lb-drive-materials .lb-drive-empty {
          color: #8291a8;
          font-size: 13px;
          margin: 10px 0 0;
        }

        .lb-drive-materials .lb-drive-note {
          font-size: 12px;
          margin: 12px 0 0;
          color: #65738a;
          line-height: 1.6;
        }

        @media (max-width: 700px) {
          .lb-drive-materials .lb-drive-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <h2>
        <BookOpen size={20} color="#466cde" />
        Homework and classwork PDFs
      </h2>

      <p className="muted tiny">
        {canEdit
          ? "Upload PDFs to Google Drive, share with the appropriate family as Viewer, and paste the file links here."
          : "Open the homework or classwork PDF shared by your tutor. Google Drive may ask you to sign in."}
      </p>

      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div
          className="success-note"
          role="status"
        >
          {message}
        </div>
      )}

      <div className="lb-drive-grid">
        {SLOTS.map(slot => {
          const link =
            currentClass?.[slot.key] || "";

          return (
            <div
              className="lb-drive-slot"
              key={slot.key}
            >
              <h3>
                <Link2
                  size={17}
                  color="#466cde"
                />
                {slot.label}
              </h3>

              {link ? (
                <a
                  className="lb-drive-button"
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={16} />
                  Open PDF in Google Drive
                </a>
              ) : (
                <p className="lb-drive-empty">
                  No PDF shared for this class yet.
                </p>
              )}

              {canEdit && (
                <>
                  <label
                    className="muted tiny"
                    htmlFor={`drive-${slot.key}-${studentId}-${currentClass?.id}`}
                  >
                    Google Drive file link
                  </label>

                  <input
                    className="lb-drive-input"
                    id={`drive-${slot.key}-${studentId}-${currentClass?.id}`}
                    type="url"
                    value={drafts[slot.key]}
                    placeholder="https://drive.google.com/file/d/.../view"
                    onChange={event =>
                      setDrafts(prev => ({
                        ...prev,
                        [slot.key]:
                          event.target.value
                      }))
                    }
                  />

                  <div className="lb-drive-actions">
                    <button
                      type="button"
                      className="lb-drive-button"
                      disabled={busy}
                      onClick={() =>
                        saveLink(slot.key)
                      }
                    >
                      <Save size={15} />
                      {link
                        ? "Save replacement link"
                        : "Save link"}
                    </button>

                    {link && (
                      <button
                        type="button"
                        className="lb-drive-button danger"
                        disabled={busy}
                        onClick={() =>
                          saveLink(slot.key, true)
                        }
                      >
                        <Trash2 size={15} />
                        Remove link
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {canEdit && (
        <p className="lb-drive-note">
          Important: Changing or removing a link here
          does not delete the old file or revoke its
          sharing permissions in Google Drive. Remove
          access or trash the old PDF in Google Drive
          separately. Do not choose "Anyone with the
          link" for private student materials.
        </p>
      )}
    </section>
  );
}
