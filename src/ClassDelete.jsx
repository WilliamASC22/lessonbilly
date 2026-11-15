
import { useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  writeBatch
} from "firebase/firestore";
import { Trash2 } from "lucide-react";
import { db } from "./firebase";

export default function ClassDelete({
  studentId,
  currentClass
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (
      busy ||
      !studentId ||
      !currentClass?.id
    ) {
      return;
    }

    const name = currentClass.name;

    if (
      !window.confirm(
        `Delete the entire '${name}' class and all its assessments from LessonBilly? This cannot be undone. Google Drive files remain separately.`
      )
    ) {
      return;
    }

    if (
      window.prompt(
        `Type DELETE ${name} to confirm:`
      ) !== `DELETE ${name}`
    ) {
      setError(
        "Deletion canceled - confirmation did not match."
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      const studentRef = doc(
        db,
        "students",
        studentId
      );

      const snap = await getDoc(studentRef);

      if (!snap.exists()) {
        throw new Error("Student not found.");
      }

      const data = snap.data();

      const classes =
        Array.isArray(data.classes) &&
        data.classes.length
          ? data.classes
          : [
              {
                id: "original",
                name:
                  data.subject ||
                  "General tutoring"
              }
            ];

      if (classes.length <= 1) {
        throw new Error(
          "A student must keep one class. Add a replacement class first."
        );
      }

      if (
        !classes.some(
          c => c.id === currentClass.id
        )
      ) {
        throw new Error(
          "Class has already been removed."
        );
      }

      const grades = await getDocs(
        collection(
          db,
          "students",
          studentId,
          "grades"
        )
      );

      const target = grades.docs.filter(
        g =>
          (g.data().classId || "original") ===
          currentClass.id
      );

      if (target.length > 450) {
        throw new Error(
          "More than 450 assessments found. Contact your administrator for a safe bulk deletion."
        );
      }

      const remaining = classes.filter(
        c => c.id !== currentClass.id
      );

      const batch = writeBatch(db);

      batch.delete(
        doc(
          db,
          "students",
          studentId,
          "practice",
          currentClass.id
        )
      );

      target.forEach(g => batch.delete(g.ref));

      batch.update(studentRef, {
        classes: remaining,
        subject: remaining[0]?.name || ""
      });

      await batch.commit();
    } catch (e) {
      setError(
        `Deletion could not finish: ${e.message}. Check the record before trying again.`
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        borderTop: "1px solid #e7edf7",
        paddingTop: 20,
        marginTop: 25
      }}
    >
      <h3 style={{ fontSize: 16 }}>
        Remove this class
      </h3>

      <p className="muted tiny">
        Deletes the selected class, assessment
        grades, and published practice activities.
        The student and their other classes remain.
        Google Drive files must be removed manually.
      </p>

      <button
        type="button"
        className="subtle-button"
        style={{
          color: "#a52d36",
          background: "#fff0f0"
        }}
        disabled={busy}
        onClick={remove}
      >
        <Trash2 size={16} />

        {busy
          ? "Deleting..."
          : `Permanently delete ${
              currentClass?.name || "class"
            }`}
      </button>

      {error && (
        <div className="alert">
          {error}
        </div>
      )}
    </div>
  );
}
