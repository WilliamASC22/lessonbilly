
import { useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  writeBatch
} from "firebase/firestore";
import { Trash2 } from "lucide-react";
import { db } from "./firebase";

// Only the tutor dashboard displays this component.
// Firestore security rules must also restrict writes to the tutor.

export default function ClassDelete({
  studentId,
  currentClass
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function deleteClass() {
    if (
      busy ||
      !studentId ||
      !currentClass?.id
    ) {
      return;
    }

    const classId = currentClass.id;
    const className = currentClass.name;

    // First confirmation.
    const confirmed = window.confirm(
      `Permanently remove this student from "${className}"?\n\n` +
      `This deletes the class from LessonBilly AND deletes ` +
      `all its draft and published grades.\n\n` +
      `This cannot be undone.\n\n` +
      `The student's account and other classes will remain.\n` +
      `Google Drive files must be deleted or unshared separately.`
    );

    if (!confirmed) return;

    // Second confirmation.
    const typed = window.prompt(
      `To confirm permanent deletion, type exactly:\n\nDELETE ${className}`
    );

    if (typed === null) return;

    if (typed !== `DELETE ${className}`) {
      setError(
        "Deletion canceled. The confirmation text did not match."
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

      const studentSnapshot = await getDoc(
        studentRef
      );

      if (!studentSnapshot.exists()) {
        throw new Error(
          "Student record not found."
        );
      }

      const student = studentSnapshot.data();

      const classes = Array.isArray(
        student.classes
      )
        ? student.classes
        : [
            {
              id: "original",
              name:
                student.subject ||
                "General tutoring"
            }
          ];

      if (
        !classes.some(
          c => c.id === classId
        )
      ) {
        throw new Error(
          "This class was already removed. Refresh the dashboard."
        );
      }

      // Keep one class so older LessonBilly
      // student records do not reappear incorrectly.
      if (classes.length < 2) {
        throw new Error(
          "This is the student's last class. " +
          "Keep at least one class on their record. " +
          "Add another class first if you need to replace it."
        );
      }

      // Find assessments belonging to this class.
      const gradesSnapshot = await getDocs(
        collection(
          db,
          "students",
          studentId,
          "grades"
        )
      );

      const classGrades =
        gradesSnapshot.docs.filter(
          grade =>
            (
              grade.data().classId ||
              "original"
            ) === classId
        );

      // Delete grades in batches.
      for (
        let i = 0;
        i < classGrades.length;
        i += 400
      ) {
        const batch = writeBatch(db);

        classGrades
          .slice(i, i + 400)
          .forEach(grade => {
            batch.delete(grade.ref);
          });

        await batch.commit();
      }

      // Remove the class without changing other
      // classes or Google Drive links.
      await runTransaction(
        db,
        async transaction => {
          const latest =
            await transaction.get(
              studentRef
            );

          if (!latest.exists()) {
            throw new Error(
              "Student record not found."
            );
          }

          const latestData =
            latest.data();

          const latestClasses =
            Array.isArray(
              latestData.classes
            )
              ? latestData.classes
              : [
                  {
                    id: "original",
                    name:
                      latestData.subject ||
                      "General tutoring"
                  }
                ];

          if (latestClasses.length < 2) {
            throw new Error(
              "The student must retain at least one class."
            );
          }

          if (
            !latestClasses.some(
              c => c.id === classId
            )
          ) {
            throw new Error(
              "The selected class no longer exists."
            );
          }

          const remainingClasses =
            latestClasses.filter(
              c => c.id !== classId
            );

          transaction.update(
            studentRef,
            {
              classes: remainingClasses,
              subject:
                remainingClasses[0]?.name ||
                ""
            }
          );
        }
      );

      // Firestore's real-time listener updates
      // the tutor and family dashboards.
    } catch (error) {
      setError(
        "Could not complete deletion. " +
        "If the connection was interrupted, " +
        "some grades may already have been deleted. " +
        "Check Firestore or retry. " +
        (error?.message || "")
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        borderTop: "1px solid #e7edf7",
        marginTop: 24,
        paddingTop: 18
      }}
    >
      <h3
        style={{
          fontSize: 16,
          marginBottom: 9
        }}
      >
        Remove student from this class
      </h3>

      <p className="muted tiny">
        Permanently delete the selected class and
        its assessment history from Firestore.
        The student account and other classes
        will remain. Google Drive files are not
        deleted automatically.
      </p>

      <button
        type="button"
        className="subtle-button"
        disabled={busy}
        onClick={deleteClass}
        style={{
          background: "#fff0f0",
          color: "#ab3636",
          border: "1px solid #f0c8c8"
        }}
      >
        <Trash2 size={16} />

        {busy
          ? "Deleting..."
          : `Delete ${
              currentClass?.name ||
              "class"
            } and its grades`}
      </button>

      {error && (
        <p
          className="alert"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
