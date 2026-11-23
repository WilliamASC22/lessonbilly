import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight, BookOpen, CheckCircle2, ChevronRight,
  GraduationCap, LockKeyhole, Mail, Menu, Plus,
  ShieldCheck, Sparkles, Star, TrendingUp, Users,
  Video, X, LogOut, PencilLine, Send
} from "lucide-react";
import {
  createUserWithEmailAndPassword, onAuthStateChanged,
  reload, sendEmailVerification, signInWithEmailAndPassword,
  signOut, updateProfile
} from "firebase/auth";
import {
  addDoc, collection, doc, getDoc, onSnapshot, query,
  serverTimestamp, setDoc, updateDoc, where
} from "firebase/firestore";
import { auth, db, TUTOR_UID } from "./firebase";
import TutorGuide from "./TutorGuide.jsx";
import DriveMaterials from "./DriveMaterials.jsx";
import PracticeCenter from "./PracticeCenter.jsx";
import FeatureShowcase from "./FeatureShowcase.jsx";

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 }
};

const subjectCards = [
  {
    icon: BookOpen,
    title: "Elementary School",
    text: "Reading, writing and math foundations."
  },
  {
    icon: GraduationCap,
    title: "Middle School",
    text: "Homework, tests and study skills."
  },
  {
    icon: TrendingUp,
    title: "High School",
    text: "Focused help in subjects I confidently teach."
  }
];

const minutes = value =>
  [60, 90, 120, 150, 180].includes(Number(value))
    ? Number(value)
    : 60;

const duration = value => {
  const n = minutes(value);
  return `${Math.floor(n / 60)} hour${
    n >= 120 ? "s" : ""
  }${n % 60 ? " 30 minutes" : ""}`;
};

const formatDate = value => {
  if (!value) return "Not scheduled";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "Not scheduled"
    : d.toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short"
      });
};

const dateInput = value => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${
    p(d.getDate())
  }T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const errText = e =>
  e?.code?.includes("permission-denied")
    ? "Firebase permission denied. Check published rules and tutor UID."
    : e?.message || "Something went wrong.";

const classList = s =>
  !s
    ? []
    : Array.isArray(s.classes) && s.classes.length
      ? s.classes.map(c => ({
          ...c,
          meetingUrl:
            c.meetingUrl ??
            (c.id === "original" ? s.meetingUrl || "" : ""),
          nextLessonAt:
            c.nextLessonAt ??
            (c.id === "original" ? s.nextLessonAt || "" : ""),
          durationMinutes: minutes(
            c.durationMinutes ??
            (c.id === "original" ? s.durationMinutes : 60)
          ),
          homeworkDriveUrl: c.homeworkDriveUrl || "",
          classworkDriveUrl: c.classworkDriveUrl || ""
        }))
      : [
          {
            id: "original",
            name: s.subject || "General tutoring",
            homeworkDriveUrl: "",
            classworkDriveUrl: "",
            meetingUrl: s.meetingUrl || "",
            nextLessonAt: s.nextLessonAt || "",
            durationMinutes: minutes(s.durationMinutes)
          }
        ];

const classOfGrade = g => g.classId || "original";

async function ensureProfile(user) {
  const ref = doc(db, "profiles", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      name: user.displayName || user.email?.split("@")[0],
      role: "parent",
      createdAt: serverTimestamp()
    });
  }

  return snap.exists()
    ? snap.data()?.role || "parent"
    : "parent";
}

function Brand({ go }) {
  return (
    <button
      className="brand"
      onClick={() => go("home")}
      aria-label="LessonBilly home"
    >
      <span className="brand-symbol">
        L<span>✓</span>
      </span>
      <span>
        Lesson<span className="brand-highlight">Billy</span>
      </span>
    </button>
  );
}

function Header({ user, go, logout }) {
  const [menu, setMenu] = useState(false);

  const navigate = page => {
    go(page);
    setMenu(false);
  };

  const anchor = id => {
    navigate("home");
    setTimeout(
      () => document.getElementById(id)?.scrollIntoView(),
      0
    );
  };

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand
          go={page =>
            navigate(
              user && page === "home"
                ? "dashboard"
                : page
            )
          }
        />

        <button
          className="mobile-menu"
          aria-label="Toggle navigation"
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X size={23} /> : <Menu size={23} />}
        </button>

        <nav
          className={menu ? "nav open" : "nav"}
          aria-label="Main navigation"
        >
          {!user && (
            <>
              <button onClick={() => navigate("home")}>
                Home
              </button>

              <a
                href="/#subjects"
                onClick={e => {
                  e.preventDefault();
                  anchor("subjects");
                }}
              >
                Subjects
              </a>

              <a
                href="/#pricing"
                onClick={e => {
                  e.preventDefault();
                  anchor("pricing");
                }}
              >
                Pricing
              </a>

              <a
                href="/#about"
                onClick={e => {
                  e.preventDefault();
                  anchor("about");
                }}
              >
                About
              </a>
            </>
          )}

          {user ? (
            <>
              <button
                className="button button-small"
                onClick={() => navigate("dashboard")}
              >
                Dashboard
              </button>

              <button
                onClick={() => navigate("practice")}
              >
                Practice Center
              </button>

              <a href={`mailto:${CONTACT_EMAIL}`}>
                Contact
              </a>

              <button
                className="nav-logout"
                onClick={() => {
                  setMenu(false);
                  logout();
                }}
              >
                <LogOut size={17} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("auth")}
              >
                Practice Center
              </button>

              <a href={`mailto:${CONTACT_EMAIL}`}>
                Contact
              </a>

              <button
                className="button button-small"
                onClick={() => navigate("auth")}
              >
                Portal Login
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function Home({ go, user }) {
  return (
    <main>
      <section className="hero" id="home">
        <div className="shell hero-grid">
          <motion.div {...fade} className="hero-copy">
            <div className="eyebrow">
              <Sparkles size={16} />
              PERSONALIZED ONLINE TUTORING
            </div>

            <h1>
              Big progress starts with{" "}
              <em>small steps.</em>
            </h1>

            <p>
              One-on-one online tutoring, friendly guidance,
              and clear updates so families can celebrate
              every win.
            </p>

            <div className="hero-buttons">
              <a
                className="button button-large"
                href={`mailto:${CONTACT_EMAIL}?subject=LessonBilly%20tutoring%20inquiry`}
              >
                Ask About Tutoring
                <ArrowRight size={18} />
              </a>

              <button
                className="button-ghost"
                onClick={() =>
                  go(user ? "dashboard" : "auth")
                }
              >
                Learning Portal
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="hero-trust">
              <span>
                <CheckCircle2 size={17} />
                100% online
              </span>

              <span>
                <CheckCircle2 size={17} />
                Personal attention
              </span>

              <span>
                <CheckCircle2 size={17} />
                Progress tracking
              </span>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <div className="illustration-orb orb-one" />
            <div className="illustration-orb orb-two" />

            <div className="demo-board">
              <div className="board-heading">
                <span className="board-icon">
                  <GraduationCap size={19} />
                </span>

                <span>
                  <b>Learning overview</b>
                  <small>
                    A little progress, every week
                  </small>
                </span>

                <span className="online-pill">
                  ● On track
                </span>
              </div>

              <div className="mock-stats">
                <div>
                  <small>Practice score</small>
                  <strong>88%</strong>
                  <span className="positive">
                    ↗ Growing
                  </span>
                </div>

                <div>
                  <small>Lessons completed</small>
                  <strong>08</strong>
                  <span>Keep it up!</span>
                </div>
              </div>

              <div className="board-chart">
                <span className="chart-label">
                  Weekly learning journey
                </span>

                <div className="chart-bars">
                  {[38, 50, 43, 61, 72, 64, 88].map(
                    (n, i) => (
                      <span
                        key={i}
                        style={{ height: `${n}%` }}
                      />
                    )
                  )}
                </div>

                <div className="chart-weeks">
                  <span>Week 1</span>
                  <span>Week 7</span>
                </div>
              </div>

              <div className="board-footer">
                <span className="avatar-stack">
                  <i>J</i>
                  <i>B</i>
                </span>

                <span>
                  Great work! You're building momentum.
                </span>

                <Star
                  size={17}
                  fill="#fbbf24"
                  color="#fbbf24"
                />
              </div>
            </div>

            <div className="floating-note">
              <span>✦</span>

              <div>
                <b>Keep going!</b>
                <small>
                  Your effort is paying off.
                </small>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="shell trust-items">
          <span>
            <ShieldCheck size={20} />
            Private parent and student portals
          </span>

          <span>
            <Video size={20} />
            Convenient online lessons
          </span>

          <span>
            <TrendingUp size={20} />
            Track improvement
          </span>
        </div>
      </section>

      <section className="section" id="subjects">
        <div className="shell">
          <motion.div
            {...fade}
            className="section-intro"
          >
            <span className="section-kicker">
              WHAT WE SUPPORT
            </span>

            <h2>
              Learning support for every stage.
            </h2>

            <p>
              Patient explanations that meet students
              where they are.
            </p>
          </motion.div>

          <div className="subject-grid">
            {subjectCards.map(
              ({ icon: Icon, title, text }) => (
                <motion.article
                  {...fade}
                  className="subject-card"
                  key={title}
                >
                  <div className="subject-icon">
                    <Icon size={27} />
                  </div>

                  <h3>{title}</h3>
                  <p>{text}</p>

                  <a href={`mailto:${CONTACT_EMAIL}`}>
                    Ask about subjects
                    <ArrowRight size={16} />
                  </a>
                </motion.article>
              )
            )}
          </div>
        </div>
      </section>

      <section
        className="section soft-section"
        id="how-it-works"
      >
        <div className="shell">
          <motion.div
            {...fade}
            className="section-intro"
          >
            <span className="section-kicker">
              SIMPLE FROM DAY ONE
            </span>

            <h2>How LessonBilly works</h2>
          </motion.div>

          <div className="steps-grid">
            {[
              {
                n: "01",
                title: "Get in touch",
                text: "Share the student's grade and topics."
              },
              {
                n: "02",
                title: "Meet online",
                text: "Join using your class meeting link."
              },
              {
                n: "03",
                title: "Practice and track",
                text:
                  "Use tutor-approved quizzes, flashcards, and published grades."
              }
            ].map(s => (
              <motion.div
                {...fade}
                className="step-card"
                key={s.n}
              >
                <span>{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FeatureShowcase
        onTry={() => go(user ? "practice" : "auth")}
      />

      <section className="section" id="pricing">
        <div className="shell pricing-layout">
          <motion.div {...fade}>
            <span className="section-kicker">
              STRAIGHTFORWARD PRICING
            </span>

            <h2>Great tutoring. Clear pricing.</h2>

            <p className="pricing-lead">
              A simple hourly rate and a recommended
              weekly routine to build consistency.
            </p>

            {[
              "One-on-one remote tutoring",
              "Parent access to published grades",
              "Tutor-approved practice between sessions",
              "No required long-term contract"
            ].map(t => (
              <div className="pricing-point" key={t}>
                <CheckCircle2 size={20} />
                {t}
              </div>
            ))}
          </motion.div>

          <motion.div
            {...fade}
            className="price-card"
          >
            <span className="price-label">
              PERSONALIZED TUTORING
            </span>

            <div className="price">
              <strong>$25</strong>
              <span>/ hour</span>
            </div>

            <div className="price-divider" />

            <p>
              Recommended: 2 hours per week per subject
            </p>

            <div className="price-summary">
              <span>
                Estimated weekly cost (2 hours)
              </span>
              <b>$50</b>
            </div>

            <a
              className="button button-large button-full"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              Get Started
              <ArrowRight size={18} />
            </a>

            <small>
              Subject availability confirmed before booking.
            </small>
          </motion.div>
        </div>
      </section>

      <section
        className="section soft-section"
        id="about"
      >
        <div className="shell pricing-layout">
          <motion.div {...fade}>
            <span className="section-kicker">
              ABOUT LESSONBILLY
            </span>

            <h2>Patient teaching. Clear progress.</h2>

            <p>
              LessonBilly is an independent tutoring
              service focused on understandable explanations,
              consistent practice, and clear updates
              to families.
            </p>

            <p>
              Students can review tutor-approved exercises
              without their answers being stored across
              sessions.
            </p>
          </motion.div>

          <motion.div {...fade} className="panel">
            <div className="pricing-point">
              <ShieldCheck size={20} />
              Private student and parent dashboards
            </div>

            <div className="pricing-point">
              <BookOpen size={20} />
              Practice Center flashcards and quizzes
            </div>

            <div className="pricing-point">
              <TrendingUp size={20} />
              Published assessment feedback
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section cta-section">
        <motion.div
          {...fade}
          className="shell cta-content"
        >
          <Sparkles size={26} />

          <h2>Ready to make learning click?</h2>

          <p>
            Tell me what your student is working on.
            We'll make a plan.
          </p>

          <a
            className="button button-light"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            Contact LessonBilly
            <ArrowRight size={18} />
          </a>
        </motion.div>
      </section>
    </main>
  );
}

function AuthCard({ role, onSuccess }) {
  const student = role === "student";

  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [guardian, setGuardian] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (register) {
        if (password.length < 8) {
          throw new Error(
            "Choose a password with at least 8 characters."
          );
        }

        if (student && !guardian) {
          throw new Error(
            "A parent or guardian must approve the student account."
          );
        }

        const result =
          await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );

        await updateProfile(result.user, {
          displayName: name.trim()
        });

        await setDoc(
          doc(db, "profiles", result.user.uid),
          {
            email: result.user.email,
            name: name.trim(),
            role,
            createdAt: serverTimestamp()
          }
        );

        await sendEmailVerification(result.user);
      } else {
        const result =
          await signInWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );

        if (
          result.user.emailVerified &&
          result.user.uid !== TUTOR_UID
        ) {
          const profile = await getDoc(
            doc(db, "profiles", result.user.uid)
          );

          const actual =
            profile.data()?.role === "student"
              ? "student"
              : "parent";

          if (actual !== role) {
            await signOut(auth);

            throw new Error(
              `This is a ${actual} account. Use ${
                actual === "student" ? "Student" : "Parent"
              } Sign In.`
            );
          }
        }
      }

      onSuccess();
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-card portal-auth-card">
      <div className="auth-icon">
        {student ? <GraduationCap /> : <Users />}
      </div>

      <h2>
        {register
          ? `Create ${role} account`
          : `${student ? "Student" : "Parent"} Sign In`}
      </h2>

      <p>
        {student
          ? "Access practice, lessons and published feedback."
          : "Track your student's classes and progress."}
      </p>

      <form
        className="stack-form"
        onSubmit={submit}
      >
        {register && (
          <label>
            Full name
            <input
              required
              maxLength={80}
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </label>
        )}

        <label>
          Email address
          <input
            required
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            required
            type="password"
            minLength={register ? 8 : 6}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>

        {register && student && (
          <label className="guardian-confirm">
            <input
              type="checkbox"
              checked={guardian}
              onChange={e => setGuardian(e.target.checked)}
            />

            <span>
              A parent or guardian approves this
              student account.
            </span>
          </label>
        )}

        <button
          className="button button-full"
          disabled={busy}
        >
          {busy
            ? "Please wait..."
            : register
              ? "Create account"
              : "Sign in"}
          <ArrowRight size={17} />
        </button>
      </form>

      {error && <div className="alert">{error}</div>}

      <div className="create-account-area">
        <span>
          {register
            ? "Already have an account?"
            : "New to LessonBilly?"}
        </span>

        <button
          className="button button-full create-account-button"
          type="button"
          onClick={() => {
            setRegister(!register);
            setError("");
          }}
        >
          {register
            ? "Back to sign in"
            : `Create ${
                student ? "Student" : "Parent"
              } Account`}
        </button>
      </div>
    </section>
  );
}

function AuthScreen({ onSuccess }) {
  return (
    <main className="auth-page">
      <div
        className="shell"
        style={{
          textAlign: "center",
          marginBottom: 30
        }}
      >
        <span className="section-kicker">
          THE LESSONBILLY LEARNING PORTAL
        </span>

        <h1>Welcome to LessonBilly</h1>

        <p>
          Choose the sign-in option for your account.
        </p>
      </div>

      <div className="shell portal-auth-grid">
        <AuthCard
          role="student"
          onSuccess={onSuccess}
        />

        <AuthCard
          role="parent"
          onSuccess={onSuccess}
        />
      </div>

      <style>{`
        .portal-auth-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
          align-items: stretch;
        }
        .create-account-area {
          margin-top: 22px;
          padding-top: 19px;
          border-top: 1px solid #e5ebf8;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }
        .create-account-button {
          background: #edf2ff !important;
          color: #345bc7 !important;
          border-color: #91aafa !important;
        }
        .guardian-confirm {
          display: flex !important;
          flex-direction: row !important;
          gap: 9px !important;
        }
        .guardian-confirm input {
          width: auto !important;
        }
        @media (max-width: 800px) {
          .portal-auth-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}

function Verification({ user, done }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function check() {
    setBusy(true);
    setMessage("");

    try {
      await reload(user);
      await user.getIdToken(true);

      if (!user.emailVerified) {
        throw new Error(
          "Open the verification link in your email first."
        );
      }

      await ensureProfile(user);
      done();
    } catch (e) {
      setMessage(errText(e));
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setBusy(true);

    try {
      await sendEmailVerification(user);
      setMessage("Verification email sent.");
    } catch (e) {
      setMessage(errText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="shell verify-wrap">
        <div
          className="auth-card"
          style={{ textAlign: "center" }}
        >
          <Mail size={34} />
          <h2>Verify your email</h2>

          <p>
            We sent a verification link to{" "}
            <strong>{user.email}</strong>.
          </p>

          <button
            className="button button-full"
            onClick={check}
            disabled={busy}
          >
            I've verified my email
          </button>

          <button
            className="text-button"
            onClick={resend}
            disabled={busy}
            style={{ marginTop: 18 }}
          >
            Resend verification email
          </button>

          {message && (
            <div className="form-notice">
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function GradeList({ grades, onPublish }) {
  if (!grades.length) {
    return (
      <div className="empty-small">
        No {onPublish ? "assessments" : "published grades"} yet.
      </div>
    );
  }

  return (
    <div className="grade-list">
      {grades.map(g => (
        <div className="grade-item" key={g.id}>
          <div className="grade-circle">
            {Math.round(g.earned / g.possible * 100)}%
          </div>

          <div className="grade-description">
            <strong>{g.title}</strong>
            <small>
              {g.earned} / {g.possible} points
              {g.feedback ? ` · ${g.feedback}` : ""}
            </small>
          </div>

          {onPublish && !g.published ? (
            <button
              className="button button-small"
              onClick={() => onPublish(g.id)}
            >
              Publish
            </button>
          ) : (
            <span className="published-label">
              {g.published ? "Published" : "Draft"}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function LearnerDashboard({ user, role }) {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [classId, setClassId] = useState("");
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState("");

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, "students"),
          where(
            role === "student"
              ? "studentUids"
              : "parentUids",
            "array-contains",
            user.uid
          )
        ),
        snap =>
          setStudents(
            snap.docs.map(d => ({
              id: d.id,
              ...d.data()
            }))
          ),
        e => setError(errText(e))
      ),
    [user.uid, role]
  );

  useEffect(() => {
    if (!students.some(s => s.id === studentId)) {
      setStudentId(students[0]?.id || "");
    }
  }, [students, studentId]);

  useEffect(() => {
    if (!studentId) {
      setGrades([]);
      return;
    }

    return onSnapshot(
      query(
        collection(db, "students", studentId, "grades"),
        where("published", "==", true)
      ),
      snap =>
        setGrades(
          snap.docs.map(d => ({
            id: d.id,
            ...d.data()
          }))
        ),
      e => setError(errText(e))
    );
  }, [studentId]);

  const student = students.find(s => s.id === studentId);
  const classes = classList(student);
  const currentClass =
    classes.find(c => c.id === classId) || classes[0];

  const classGrades = grades.filter(
    g => classOfGrade(g) === currentClass?.id
  );

  const totals = classGrades.reduce(
    (a, g) => ({
      earned: a.earned + g.earned,
      possible: a.possible + g.possible
    }),
    { earned: 0, possible: 0 }
  );

  return (
    <div className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <span className="section-kicker">
            {role === "student" ? "STUDENT" : "PARENT"} PORTAL
          </span>

          <h1>
            {role === "student"
              ? "Your learning dashboard"
              : "Your student's progress"}
          </h1>

          <p>
            Welcome, {user.displayName || user.email}.
            Published results appear here.
          </p>
        </div>

        <span className="secure-chip">
          <LockKeyhole size={16} />
          Private access
        </span>
      </div>

      {error && <div className="alert">{error}</div>}

      {!students.length ? (
        <div className="panel empty-panel">
          <Users size={35} />
          <h2>Your account is ready.</h2>

          <p>
            Your tutor will connect your account
            to a student record.
          </p>

          <div className="hint-box">
            Your email: <strong>{user.email}</strong>
          </div>
        </div>
      ) : (
        <>
          <div className="student-tabs">
            {students.map(s => (
              <button
                className={
                  studentId === s.id ? "selected" : ""
                }
                key={s.id}
                onClick={() => {
                  setStudentId(s.id);
                  setClassId("");
                }}
              >
                {s.name}
              </button>
            ))}
          </div>

          <div
            className="panel"
            style={{ marginBottom: 20 }}
          >
            <h2>Classes</h2>

            <div className="student-tabs">
              {classes.map(c => (
                <button
                  key={c.id}
                  className={
                    currentClass?.id === c.id
                      ? "selected"
                      : ""
                  }
                  onClick={() => setClassId(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <p className="muted tiny">
              Grade level:{" "}
              {student?.gradeLevel || "Not set"}.
              Visit Practice Center for flashcards
              and quizzes.
            </p>
          </div>

          <div className="metric-grid">
            <div className="metric">
              <small>Published assessments</small>
              <strong>{classGrades.length}</strong>
              <span>{currentClass?.name}</span>
            </div>

            <div className="metric">
              <small>Class score</small>
              <strong>
                {totals.possible
                  ? `${Math.round(
                      (totals.earned / totals.possible) * 100
                    )}%`
                  : "-"}
              </strong>
            </div>

            <div className="metric">
              <small>Selected class</small>
              <strong className="metric-subject">
                {currentClass?.name}
              </strong>
              <span>{student?.gradeLevel}</span>
            </div>
          </div>

          <div className="dashboard-grid">
            <section className="panel">
              <div className="panel-heading">
                <h2>Grade history</h2>
                <span className="chip">
                  Published only
                </span>
              </div>

              <GradeList grades={classGrades} />
            </section>

            <section className="panel">
              <div className="panel-heading">
                <h2>
                  Next {currentClass?.name} lesson
                </h2>
              </div>

              <p className="schedule-date">
                {formatDate(currentClass?.nextLessonAt)}
              </p>

              <p className="muted">
                {duration(currentClass?.durationMinutes)}{" "}
                planned session
              </p>

              {currentClass?.meetingUrl ? (
                <a
                  className="button button-full"
                  href={currentClass.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Google Meet
                  <Video size={18} />
                </a>
              ) : (
                <div className="empty-small">
                  Your tutor hasn't shared a link.
                </div>
              )}
            </section>
          </div>

          {currentClass && (
            <DriveMaterials
              key={`${studentId}:${currentClass.id}`}
              studentId={studentId}
              currentClass={currentClass}
            />
          )}
        </>
      )}
    </div>
  );
}

function TutorDashboard({ user }) {
  const [students, setStudents] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [classId, setClassId] = useState("");
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const [newStudent, setNewStudent] = useState({
    name: "",
    parentEmail: "",
    studentEmail: "",
    gradeLevel: "",
    subject: ""
  });

  const [newGrade, setNewGrade] = useState({
    title: "",
    earned: "",
    possible: "",
    feedback: ""
  });

  const [linkEmail, setLinkEmail] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [newClass, setNewClass] = useState("");
  const [rename, setRename] = useState("");

  const [session, setSession] = useState({
    meetingUrl: "",
    lessonAt: "",
    durationMinutes: 60
  });

  useEffect(() => {
    const a = onSnapshot(
      collection(db, "students"),
      snap =>
        setStudents(
          snap.docs.map(d => ({
            id: d.id,
            ...d.data()
          }))
        ),
      e => setError(errText(e))
    );

    const b = onSnapshot(
      collection(db, "profiles"),
      snap =>
        setProfiles(
          snap.docs.map(d => ({
            id: d.id,
            ...d.data()
          }))
        ),
      e => setError(errText(e))
    );

    return () => {
      a();
      b();
    };
  }, []);

  useEffect(() => {
    if (!students.some(s => s.id === studentId)) {
      setStudentId(students[0]?.id || "");
    }
  }, [students, studentId]);

  useEffect(() => {
    if (!studentId) {
      setGrades([]);
      return;
    }

    return onSnapshot(
      collection(db, "students", studentId, "grades"),
      snap =>
        setGrades(
          snap.docs.map(d => ({
            id: d.id,
            ...d.data()
          }))
        ),
      e => setError(errText(e))
    );
  }, [studentId]);

  const student = students.find(s => s.id === studentId);
  const classes = classList(student);
  const currentClass =
    classes.find(c => c.id === classId) || classes[0];

  useEffect(
    () => setLinkEmail(student?.studentEmail || ""),
    [studentId, student?.studentEmail]
  );

  useEffect(
    () => setGradeLevel(student?.gradeLevel || ""),
    [studentId, student?.gradeLevel]
  );

  useEffect(
    () => setRename(currentClass?.name || ""),
    [studentId, currentClass?.id, currentClass?.name]
  );

  useEffect(() => {
    setSession({
      meetingUrl: currentClass?.meetingUrl || "",
      lessonAt: dateInput(currentClass?.nextLessonAt),
      durationMinutes: minutes(
        currentClass?.durationMinutes
      )
    });
  }, [
    studentId,
    currentClass?.id,
    currentClass?.meetingUrl,
    currentClass?.nextLessonAt,
    currentClass?.durationMinutes
  ]);

  const sorted = grades
    .filter(g => classOfGrade(g) === currentClass?.id)
    .sort(
      (a, b) =>
        (b.createdAt?.seconds || 0) -
        (a.createdAt?.seconds || 0)
    );

  async function run(operation, success) {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await operation();
      setNotice(success);
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  async function createStudent(event) {
    event.preventDefault();

    await run(async () => {
      const email = newStudent.parentEmail
        .trim()
        .toLowerCase();

      const p = profiles.find(
        x =>
          x.email?.toLowerCase() === email &&
          x.role === "parent"
      );

      if (!p) {
        throw new Error(
          "The parent must register and verify first."
        );
      }

      const se = newStudent.studentEmail
        .trim()
        .toLowerCase();

      const sp = se
        ? profiles.find(
            x =>
              x.email?.toLowerCase() === se &&
              x.role === "student"
          )
        : null;

      if (se && !sp) {
        throw new Error(
          "Student profile not found. Ask them to register and verify or leave it blank."
        );
      }

      const first = newStudent.subject.trim();

      const ref = await addDoc(
        collection(db, "students"),
        {
          name: newStudent.name.trim(),
          parentEmail: email,
          parentUids: [p.id],
          studentEmail: sp?.email || "",
          studentUids: sp ? [sp.id] : [],
          gradeLevel: newStudent.gradeLevel.trim(),
          subject: first,

          classes: [
            {
              id: "original",
              name: first,
              homeworkDriveUrl: "",
              classworkDriveUrl: "",
              meetingUrl: "",
              nextLessonAt: "",
              durationMinutes: 60
            }
          ],

          meetingUrl: "",
          nextLessonAt: "",
          durationMinutes: 60,
          createdAt: serverTimestamp()
        }
      );

      setStudentId(ref.id);
      setClassId("");

      setNewStudent({
        name: "",
        parentEmail: "",
        studentEmail: "",
        gradeLevel: "",
        subject: ""
      });
    }, "Student added and linked to the parent.");
  }

  async function saveGradeLevel(event) {
    event.preventDefault();

    await run(async () => {
      if (!gradeLevel.trim()) {
        throw new Error("Enter a grade level.");
      }

      await updateDoc(
        doc(db, "students", studentId),
        { gradeLevel: gradeLevel.trim() }
      );
    }, "Grade level updated.");
  }

  async function addClass(event) {
    event.preventDefault();

    await run(async () => {
      const name = newClass.trim();

      if (
        !name ||
        classes.some(
          c =>
            c.name.toLowerCase() === name.toLowerCase()
        )
      ) {
        throw new Error(
          "Enter a new, distinct class name."
        );
      }

      const id = doc(
        collection(db, "students")
      ).id;

      await updateDoc(
        doc(db, "students", studentId),
        {
          classes: [
            ...classes,
            {
              id,
              name,
              homeworkDriveUrl: "",
              classworkDriveUrl: "",
              meetingUrl: "",
              nextLessonAt: "",
              durationMinutes: 60
            }
          ]
        }
      );

      setClassId(id);
      setNewClass("");
    }, "Class added.");
  }

  async function renameClass(event) {
    event.preventDefault();

    await run(async () => {
      const name = rename.trim();

      if (
        !name ||
        classes.some(
          c =>
            c.id !== currentClass.id &&
            c.name.toLowerCase() === name.toLowerCase()
        )
      ) {
        throw new Error(
          "Choose a unique class name."
        );
      }

      await updateDoc(
        doc(db, "students", studentId),
        {
          classes: classes.map(c =>
            c.id === currentClass.id
              ? { ...c, name }
              : c
          )
        }
      );
    }, "Class renamed; grades remain intact.");
  }

  async function linkStudent(event) {
    event.preventDefault();

    await run(async () => {
      const email = linkEmail
        .trim()
        .toLowerCase();

      const p = profiles.find(
        x =>
          x.email?.toLowerCase() === email &&
          x.role === "student"
      );

      if (email && !p) {
        throw new Error(
          "No student profile found. The student must register first."
        );
      }

      await updateDoc(
        doc(db, "students", studentId),
        {
          studentEmail: email || "",
          studentUids: p ? [p.id] : []
        }
      );
    }, "Student account access updated.");
  }

  async function addGrade(event) {
    event.preventDefault();

    await run(async () => {
      const earned = Number(newGrade.earned);
      const possible = Number(newGrade.possible);

      if (
        !newGrade.title.trim() ||
        !Number.isFinite(earned) ||
        !Number.isFinite(possible) ||
        earned < 0 ||
        possible <= 0 ||
        earned > possible
      ) {
        throw new Error(
          "Enter a title and valid earned/possible points."
        );
      }

      await addDoc(
        collection(
          db,
          "students",
          studentId,
          "grades"
        ),
        {
          title: newGrade.title.trim(),
          earned,
          possible,
          feedback: newGrade.feedback.trim(),
          classId: currentClass.id,
          published: false,
          createdAt: serverTimestamp()
        }
      );

      setNewGrade({
        title: "",
        earned: "",
        possible: "",
        feedback: ""
      });
    }, "Grade saved as a private draft.");
  }

  async function publishGrade(id) {
    if (!window.confirm("Publish this score to the family?")) {
      return;
    }

    await run(async () => {
      await updateDoc(
        doc(
          db,
          "students",
          studentId,
          "grades",
          id
        ),
        {
          published: true,
          publishedAt: serverTimestamp()
        }
      );
    }, "Score published; email notification is manual.");
  }

  async function saveSession(event) {
    event.preventDefault();

    await run(async () => {
      const url = session.meetingUrl.trim();

      if (
        url &&
        (
          new URL(url).protocol !== "https:" ||
          new URL(url).hostname !== "meet.google.com"
        )
      ) {
        throw new Error(
          "Enter a valid Google Meet HTTPS link."
        );
      }

      await updateDoc(
        doc(db, "students", studentId),
        {
          classes: classes.map(c =>
            c.id === currentClass.id
              ? {
                  ...c,
                  meetingUrl: url,
                  nextLessonAt: session.lessonAt
                    ? new Date(
                        session.lessonAt
                      ).toISOString()
                    : "",
                  durationMinutes: minutes(
                    session.durationMinutes
                  )
                }
              : c
          )
        }
      );
    }, "Lesson saved.");
  }

  function emailParent() {
    const subject = encodeURIComponent(
      `LessonBilly - New progress update for ${student?.name}`
    );

    const body = encodeURIComponent(
      `Hello,\n\nA new assessment result is available in your LessonBilly parent portal at ${window.location.origin}.\n\nThank you,\nLessonBilly`
    );

    window.location.href =
      `mailto:${student.parentEmail}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <span className="section-kicker">
            TUTOR WORKSPACE
          </span>

          <h1>
            Good to see you,{" "}
            {user.displayName || "Tutor"}.
          </h1>

          <p>
            Manage students, classes, published
            grades and shared learning resources.
          </p>
        </div>

        <span className="secure-chip">
          <ShieldCheck size={17} />
          Tutor access
        </span>
      </div>

      {error && <div className="alert">{error}</div>}

      {notice && (
        <div className="success-note">
          {notice}
        </div>
      )}

      <TutorGuide />

      <div className="metric-grid">
        <div className="metric">
          <small>Students</small>
          <strong>{students.length}</strong>
        </div>

        <div className="metric">
          <small>Registered accounts</small>
          <strong>{profiles.length}</strong>
        </div>

        <div className="metric">
          <small>Practice Center</small>
          <strong className="metric-subject">
            Tutor-approved
          </strong>
          <span>Open the top tab to publish</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>
              <Users size={19} />
              Add a student
            </h2>
          </div>

          <p className="muted tiny">
            A parent must register and verify
            their email first.
          </p>

          <form
            className="stack-form"
            onSubmit={createStudent}
          >
            <label>
              Student name

              <input
                required
                maxLength={80}
                value={newStudent.name}
                onChange={e =>
                  setNewStudent({
                    ...newStudent,
                    name: e.target.value
                  })
                }
              />
            </label>

            <label>
              Parent's registered email

              <input
                required
                type="email"
                value={newStudent.parentEmail}
                onChange={e =>
                  setNewStudent({
                    ...newStudent,
                    parentEmail: e.target.value
                  })
                }
              />
            </label>

            <label>
              Student account email (optional)

              <input
                type="email"
                value={newStudent.studentEmail}
                onChange={e =>
                  setNewStudent({
                    ...newStudent,
                    studentEmail: e.target.value
                  })
                }
              />
            </label>

            <div className="form-pair">
              <label>
                Grade level

                <input
                  required
                  maxLength={30}
                  value={newStudent.gradeLevel}
                  onChange={e =>
                    setNewStudent({
                      ...newStudent,
                      gradeLevel: e.target.value
                    })
                  }
                />
              </label>

              <label>
                First class

                <input
                  required
                  maxLength={60}
                  value={newStudent.subject}
                  onChange={e =>
                    setNewStudent({
                      ...newStudent,
                      subject: e.target.value
                    })
                  }
                />
              </label>
            </div>

            <button
              className="button"
              disabled={busy}
            >
              <Plus size={17} />
              Add student
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>
              <GraduationCap size={19} />
              Your students
            </h2>
          </div>

          {students.length ? (
            <div className="student-list">
              {students.map(s => (
                <button
                  className={
                    s.id === studentId
                      ? "student-row active"
                      : "student-row"
                  }
                  key={s.id}
                  onClick={() => {
                    setStudentId(s.id);
                    setClassId("");
                  }}
                >
                  <span className="student-avatar">
                    {s.name?.charAt(0) || "?"}
                  </span>

                  <span>
                    <b>{s.name}</b>
                    <small>
                      {s.subject} · {s.gradeLevel}
                    </small>
                  </span>

                  <ChevronRight size={17} />
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-small">
              No students added yet.
            </div>
          )}
        </section>
      </div>

      {student && (
        <>
          <div className="section-divider">
            <h2>Manage {student.name}</h2>
            <span>{student.parentEmail}</span>
          </div>

          <section
            className="panel"
            style={{ marginTop: 22 }}
          >
            <div className="panel-heading">
              <h2>
                <BookOpen size={19} />
                Student details and classes
              </h2>
            </div>

            <form
              className="stack-form"
              onSubmit={saveGradeLevel}
            >
              <label>
                Student grade level

                <input
                  maxLength={30}
                  value={gradeLevel}
                  onChange={e =>
                    setGradeLevel(e.target.value)
                  }
                />
              </label>

              <button
                className="button"
                disabled={busy}
              >
                Save grade level
              </button>
            </form>

            <h2 style={{ marginTop: 30 }}>
              Classes for {student.name}
            </h2>

            <div className="student-tabs">
              {classes.map(c => (
                <button
                  className={
                    c.id === currentClass?.id
                      ? "selected"
                      : ""
                  }
                  key={c.id}
                  onClick={() => setClassId(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <p className="muted tiny">
              The selected class controls the
              assessments, meeting link, Drive
              PDFs, and Practice Center activities.
            </p>

            <div className="dashboard-grid">
              <form
                className="stack-form"
                onSubmit={addClass}
              >
                <label>
                  Add another class

                  <input
                    required
                    maxLength={60}
                    placeholder="e.g. English"
                    value={newClass}
                    onChange={e =>
                      setNewClass(e.target.value)
                    }
                  />
                </label>

                <button
                  className="button"
                  disabled={busy}
                >
                  <Plus size={17} />
                  Add class
                </button>
              </form>

              <form
                className="stack-form"
                onSubmit={renameClass}
              >
                <label>
                  Rename selected class

                  <input
                    required
                    maxLength={60}
                    value={rename}
                    onChange={e =>
                      setRename(e.target.value)
                    }
                  />
                </label>

                <button
                  className="button"
                  disabled={busy}
                >
                  Rename class
                </button>
              </form>
            </div>
          </section>

          <section
            className="panel"
            style={{ marginTop: 22 }}
          >
            <div className="panel-heading">
              <h2>
                <GraduationCap size={19} />
                Student account access
              </h2>
            </div>

            <form
              className="stack-form"
              onSubmit={linkStudent}
            >
              <label>
                Student's registered email

                <input
                  type="email"
                  value={linkEmail}
                  onChange={e =>
                    setLinkEmail(e.target.value)
                  }
                  placeholder="student@example.com"
                />
              </label>

              <button
                className="button"
                disabled={busy}
              >
                Save student access
              </button>
            </form>
          </section>

          <div className="dashboard-grid">
            <section className="panel">
              <div className="panel-heading">
                <h2>
                  <PencilLine size={19} />
                  Add {currentClass?.name} assessment
                </h2>
              </div>

              <form
                className="stack-form"
                onSubmit={addGrade}
              >
                <label>
                  Assessment title

                  <input
                    required
                    maxLength={100}
                    value={newGrade.title}
                    onChange={e =>
                      setNewGrade({
                        ...newGrade,
                        title: e.target.value
                      })
                    }
                  />
                </label>

                <div className="form-pair">
                  <label>
                    Points earned

                    <input
                      required
                      type="number"
                      min="0"
                      step="any"
                      value={newGrade.earned}
                      onChange={e =>
                        setNewGrade({
                          ...newGrade,
                          earned: e.target.value
                        })
                      }
                    />
                  </label>

                  <label>
                    Points possible

                    <input
                      required
                      type="number"
                      min="0.01"
                      step="any"
                      value={newGrade.possible}
                      onChange={e =>
                        setNewGrade({
                          ...newGrade,
                          possible: e.target.value
                        })
                      }
                    />
                  </label>
                </div>

                <label>
                  Optional feedback

                  <textarea
                    rows="3"
                    maxLength={700}
                    value={newGrade.feedback}
                    onChange={e =>
                      setNewGrade({
                        ...newGrade,
                        feedback: e.target.value
                      })
                    }
                  />
                </label>

                <button
                  className="button"
                  disabled={busy}
                >
                  <Plus size={17} />
                  Save draft grade
                </button>
              </form>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <h2>Assessment history</h2>

                <button
                  className="subtle-button"
                  onClick={emailParent}
                >
                  <Send size={16} />
                  Email parent
                </button>
              </div>

              <GradeList
                grades={sorted}
                onPublish={publishGrade}
              />

              <p className="muted tiny">
                Published grades are visible to
                the linked family. Emails must
                be sent manually.
              </p>
            </section>
          </div>

          <section className="panel session-panel">
            <div className="panel-heading">
              <h2>
                Upcoming {currentClass?.name} lesson
              </h2>
            </div>

            <form
              className="session-form"
              onSubmit={saveSession}
            >
              <label>
                Google Meet link
                <input
                  type="url"
                  value={session.meetingUrl}
                  onChange={e =>
                    setSession({
                      ...session,
                      meetingUrl: e.target.value
                    })
                  }
                  placeholder="https://meet.google.com/abc-defg-hij"
                />
              </label>

              <label>
                Lesson date/time
                <input
                  type="datetime-local"
                  value={session.lessonAt}
                  onChange={e =>
                    setSession({
                      ...session,
                      lessonAt: e.target.value
                    })
                  }
                />
              </label>

              <label>
                Lesson duration
                <select
                  value={session.durationMinutes}
                  onChange={e =>
                    setSession({
                      ...session,
                      durationMinutes: Number(
                        e.target.value
                      )
                    })
                  }
                >
                  {[60, 90, 120, 150, 180].map(n => (
                    <option value={n} key={n}>
                      {duration(n)}
                    </option>
                  ))}
                </select>
              </label>

              <button
                className="button"
                disabled={busy}
              >
                Save lesson
              </button>
            </form>

            <p className="muted tiny">
              Google Meet hosts the video call;
              LessonBilly does not control meeting
              length.
            </p>
          </section>

          {currentClass && (
            <DriveMaterials
              key={`${studentId}:${currentClass.id}`}
              studentId={studentId}
              currentClass={currentClass}
              canEdit
            />
          )}
        </>
      )}
    </div>
  );
}

function Privacy() {
  return (
    <main className="section">
      <div className="shell privacy-page">
        <span className="section-kicker">
          LESSONBILLY
        </span>

        <h1>Privacy Information</h1>

        <p>
          LessonBilly uses Firebase Authentication and
          Firestore for accounts, grades, class information,
          Google Drive links, and tutor approved practice
          activities. Google Drive hosts shared PDFs;
          Google Meet hosts live lessons.
        </p>

        <p>
          Student practice selections and scores are not
          saved in Firestore. Unpublished notes and PDF
          text for practice creation stay in the current
          browser session. Google Drive permissions separately control who can open shared PDFs.
        </p>

        <a
          className="button"
          href={`mailto:${CONTACT_EMAIL}`}
        >
          Privacy questions
          <Mail size={16} />
        </a>
      </div>
    </main>
  );
}

function Footer({ go }) {
  return (
    <footer className="footer">
      <div className="shell footer-layout">
        <div>
          <Brand go={go} />
          <p>
            Personalized tutoring. Meaningful progress.
          </p>
        </div>

        <div>
          <span>Explore</span>
          <button onClick={() => go("home")}>
            Home
          </button>
          <button onClick={() => go("practice")}>
            Practice Center
          </button>
        </div>

        <div>
          <span>Connect</span>
          <a href={`mailto:${CONTACT_EMAIL}`}>
            Email LessonBilly
          </a>
          <button onClick={() => go("auth")}>
            Portal login
          </button>
          <button onClick={() => go("privacy")}>
            Privacy
          </button>
        </div>
      </div>

      <div className="shell footer-bottom">
        © {new Date().getFullYear()} LessonBilly.
        All rights reserved.

        <span>
          Remote tutoring · Accessible anywhere
        </span>
      </div>
    </footer>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [verified, setVerified] = useState(false);
  const [role, setRole] = useState("parent");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [error, setError] = useState("");

  useEffect(
    () =>
      onAuthStateChanged(auth, async next => {
        setUser(next);
        setError("");

        if (!next) {
          setVerified(false);
          setRole("parent");
          setLoading(false);
          return;
        }

        try {
          await reload(next);
          await next.getIdToken(true);
          setVerified(next.emailVerified);

          if (next.emailVerified) {
            setRole(
              (await ensureProfile(next)) === "student"
                ? "student"
                : "parent"
            );
          }
        } catch (e) {
          setError(errText(e));
        } finally {
          setLoading(false);
        }
      }),
    []
  );

  const isTutor = Boolean(
    user?.uid &&
    TUTOR_UID &&
    user.uid === TUTOR_UID &&
    TUTOR_UID !== "PASTE_TUTOR_UID_HERE"
  );

  function go(next) {
    setPage(next);
    window.scrollTo(0, 0);
  }

  async function logout() {
    await signOut(auth);
    go("home");
  }

  async function verifiedDone() {
    setVerified(true);

    const snap = await getDoc(
      doc(db, "profiles", user.uid)
    );

    setRole(
      snap.data()?.role === "student"
        ? "student"
        : "parent"
    );

    go("dashboard");
  }

  return (
    <>
      <Header
        user={user}
        go={go}
        logout={logout}
      />

      {loading ? (
        <main className="loading-screen">
          <div className="loader" />
          <p>Loading LessonBilly...</p>
        </main>
      ) : page === "home" ? (
        <Home user={user} go={go} />
      ) : page === "privacy" ? (
        <Privacy />
      ) : user && !verified ? (
        <Verification
          user={user}
          done={verifiedDone}
        />
      ) : page === "auth" && !user ? (
        <AuthScreen
          onSuccess={() => go("dashboard")}
        />
      ) : page === "practice" && user ? (
        <PracticeCenter
          user={user}
          isTutor={isTutor}
          role={role}
        />
      ) : user ? (
        <main className="dashboard-page shell">
          {error && (
            <div className="alert">
              {error}
            </div>
          )}

          {isTutor ? (
            <TutorDashboard user={user} />
          ) : (
            <LearnerDashboard
              user={user}
              role={role}
            />
          )}
        </main>
      ) : (
        <AuthScreen
          onSuccess={() => go("dashboard")}
        />
      )}

      <Footer go={go} />
    </>
  );
}
