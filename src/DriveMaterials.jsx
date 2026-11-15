import { useEffect, useState } from "react";
import {
  doc,
  runTransaction
} from "firebase/firestore";
import {
  BookOpen,
  ExternalLink,
  Link2,
  Save,
  Trash2
} from "lucide-react";
import { db } from "./firebase";
import ClassDelete from "./ClassDelete.jsx";

const slots = [
  {
    key: "homeworkDriveUrl",
    label: "Homework PDF"
  },
  {
    key: "classworkDriveUrl",
    label: "Classwork PDF"
  }
];

function normalizeDriveUrl(value) {
  if (!value.trim()) return "";

  let url;

  try {
    url = new URL(value.trim());
  } catch {
    throw new Error(
      "Enter a valid Google Drive file link."
    );
  }

  if (
    url.protocol !== "https:" ||
    url.hostname !== "drive.google.com"
  ) {
    throw new Error(
      "Use a secure drive.google.com file link."
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
      "Use a Google Drive file link, not a folder link."
    );
  }

  return `https://drive.google.com/file/d/${id}/view`;
}

export default function DriveMaterials({
  studentId,
  currentClass,
  canEdit = false
}) {
  const [draft, setDraft] = useState({
    homeworkDriveUrl: "",
    classworkDriveUrl: ""
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setDraft({
      homeworkDriveUrl:
        currentClass?.homeworkDriveUrl || "",
      classworkDriveUrl:
        currentClass?.classworkDriveUrl || ""
    });

    setError("");
    setNotice("");
  }, [
    studentId,
    currentClass?.id,
    currentClass?.homeworkDriveUrl,
    currentClass?.classworkDriveUrl
  ]);

  async function save(key, remove = false) {
    if (!canEdit || !currentClass?.id) return;

    if (
      remove &&
      !window.confirm(
        "Remove this link from LessonBilly? The Google Drive file itself will remain shared until you remove access in Drive."
      )
    ) {
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const value = remove
        ? ""
        : normalizeDriveUrl(draft[key]);

      await runTransaction(
        db,
        async tx => {
          const ref = doc(
            db,
            "students",
            studentId
          );

          const snap = await tx.get(ref);

          if (!snap.exists()) {
            throw new Error(
              "Student record was not found."
            );
          }

          const data = snap.data();

          const all =
            Array.isArray(data.classes) &&
            data.classes.length
              ? data.classes
              : [
                  {
                    id: "original",
                    name:
                      data.subject ||
                      "General tutoring",
                    meetingUrl:
                      data.meetingUrl || "",
                    nextLessonAt:
                      data.nextLessonAt || "",
                    durationMinutes:
                      data.durationMinutes || 60
                  }
                ];

          if (
            !all.some(
              c => c.id === currentClass.id
            )
          ) {
            throw new Error(
              "Class was removed. Refresh the dashboard."
            );
          }

          tx.update(ref, {
            classes: all.map(c =>
              c.id === currentClass.id
                ? {
                    ...c,
                    [key]: value
                  }
                : c
            )
          });
        }
      );

      setNotice(
        remove
          ? "Link removed from LessonBilly; remove access in Google Drive separately."
          : "File link saved for this class."
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="panel lb-drive"
      style={{ marginTop: 25 }}
    >
      <div className="panel-heading">
        <h2>
          <BookOpen size={19} />
          Homework and classwork PDFs
        </h2>
      </div>

      <p className="muted tiny">
        {canEdit
          ? "Upload the PDF in Google Drive, share it as Viewer with the correct family, then save its link. Only the tutor can change links."
          : "Open the PDFs shared by your tutor. Google Drive may ask you to sign in with an invited account."}
      </p>

      {error && (
        <div className="alert">{error}</div>
      )}

      {notice && (
        <div className="success-note">{notice}</div>
      )}

      <div className="dashboard-grid">
        {slots.map(slot => (
          <div
            key={slot.key}
            className="lb-drive-slot"
          >
            <h3>
              <Link2 size={17} />
              {slot.label}
            </h3>

            {currentClass?.[slot.key] ? (
              <a
                className="subtle-button"
                href={currentClass[slot.key]}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={15} />
                Open PDF in Google Drive
              </a>
            ) : (
              <p className="muted tiny">
                No file shared yet.
              </p>
            )}

            {canEdit && (
              <div className="lb-drive-inputs">
                <label>
                  Google Drive file URL
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/.../view"
                    value={draft[slot.key]}
                    onChange={e =>
                      setDraft(old => ({
                        ...old,
                        [slot.key]: e.target.value
                      }))
                    }
                  />
                </label>

                <div className="lb-drive-actions">
                  <button
                    className="subtle-button"
                    type="button"
                    disabled={busy}
                    onClick={() => save(slot.key)}
                  >
                    <Save size={15} />
                    Save link
                  </button>

                  {currentClass?.[slot.key] && (
                    <button
                      className="subtle-button lb-danger"
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        save(slot.key, true)
                      }
                    >
                      <Trash2 size={15} />
                      Remove link
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {canEdit && (
        <>
          <p className="muted tiny">
            Removing a link here does not delete the
            Google Drive file. Keep PDFs Restricted
            and revoke sharing separately.
          </p>

          <ClassDelete
            studentId={studentId}
            currentClass={currentClass}
          />
        </>
      )}

      <style>{`
        .lb-drive-slot {
          padding: 18px;
          border: 1px solid #e3eaf8;
          border-radius: 12px;
        }

        .lb-drive-slot h3 {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 16px;
        }

        .lb-drive-inputs {
          margin-top: 13px;
        }

        .lb-drive-inputs label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          font-size: 12px;
          font-weight: 800;
          color: #506383;
        }

        .lb-drive-inputs input {
          width: 100%;
          border: 1px solid #dfe6f4;
          border-radius: 8px;
          padding: 11px;
        }

        .lb-drive-actions {
          display: flex;
          gap: 9px;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .lb-danger {
          background: #fff0f0 !important;
          color: #ae3737 !important;
        }
      `}</style>
    </section>
  );
}
