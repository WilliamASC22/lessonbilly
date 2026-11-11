import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight, BookOpen, CheckCircle2, ChevronRight,
  GraduationCap, LockKeyhole, Mail, Menu,
  Plus, ShieldCheck, Sparkles, Star, TrendingUp, Users, Video,
  X, LogOut, PencilLine, Send
} from "lucide-react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import { auth, db, TUTOR_UID } from "./firebase";

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;

const subjects = [
  {
    icon: BookOpen,
    title: "Elementary School",
    text: "Build strong foundations in reading, writing, and math."
  },
  {
    icon: GraduationCap,
    title: "Middle School",
    text: "Improve confidence with homework, tests, and study skills."
  },
  {
    icon: TrendingUp,
    title: "High School",
    text: "Get focused help with subjects I can confidently teach."
  }
];

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.12 },
  transition: { duration: 0.6 }
};

function readableError(error) {
  const code = error?.code || "";

  if (code.includes("email-already-in-use"))
    return "This email already has an account. Try logging in.";

  if (code.includes("invalid-credential"))
    return "Incorrect email or password.";

  if (code.includes("weak-password"))
    return "Choose a stronger password (at least 8 characters).";

  if (code.includes("permission-denied"))
    return "Firebase denied access. Check your Firestore security rules and tutor UID.";

  if (code.includes("invalid-email"))
    return "Enter a valid email address.";

  if (code.includes("too-many-requests"))
    return "Too many attempts. Try again later.";

  return error?.message || "Something went wrong. Please try again.";
}

function formatDate(value) {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not scheduled";

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function normalizedLessonMinutes(value) {
  const minutes = Number(value);

  return [60, 90, 120, 150, 180].includes(minutes)
    ? minutes
    : 60;
}

function formatLessonDuration(value) {
  const minutes = normalizedLessonMinutes(value);
  const hours = Math.floor(minutes / 60);
  const extraMinutes = minutes % 60;

  return `${hours} hour${hours === 1 ? "" : "s"}${
    extraMinutes ? ` ${extraMinutes} minutes` : ""
  }`;
}

function toLocalInput(iso) {
  if (!iso) return "";

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return "";

  const pad = number => String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

async function ensureProfile(user) {
  const ref = doc(db, "profiles", user.uid);
  const existing = await getDoc(ref);

  if (!existing.exists()) {
    await setDoc(ref, {
      email: user.email,
      name: user.displayName || user.email.split("@")[0],
      role: "parent",
      createdAt: serverTimestamp()
    });
  }

  return existing.exists()
    ? existing.data()?.role || "parent"
    : "parent";
}

function Brand({ onClick }) {
  return (
    <button
      className="brand"
      onClick={onClick}
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

function Header({ setPage, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function go(next) {
    setPage(next);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand onClick={() => go("home")} />

        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <nav
          className={menuOpen ? "nav open" : "nav"}
          aria-label="Main navigation"
        >
          <button onClick={() => go("home")}>Home</button>

          <a
            href="/#subjects"
            onClick={() => {
              go("home");
              setTimeout(
                () => document.getElementById("subjects")?.scrollIntoView(),
                0
              );
            }}
          >
            Subjects
          </a>

          <a
            href="/#pricing"
            onClick={() => {
              go("home");
              setTimeout(
                () => document.getElementById("pricing")?.scrollIntoView(),
                0
              );
            }}
          >
            Pricing
          </a>

          <a
            href="/#about"
            onClick={() => {
              go("home");
              setTimeout(
                () => document.getElementById("about")?.scrollIntoView(),
                0
              );
            }}
          >
            About
          </a>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </a>

          {user ? (
            <>
              <button
                className="button button-small"
                onClick={() => go("dashboard")}
              >
                Dashboard
              </button>

              <button
                className="nav-logout"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                title="Sign out"
              >
                <LogOut size={18} /> Sign out
              </button>
            </>
          ) : (
            <button
              className="button button-small"
              onClick={() => go("auth")}
            >
              Portal Login <ArrowRight size={16} />
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

function Home({ setPage }) {
  return (
    <main>
      <section className="hero" id="home">
        <div className="shell hero-grid">
          <motion.div {...fadeIn} className="hero-copy">
            <div className="eyebrow">
              <Sparkles size={16} /> PERSONALIZED ONLINE TUTORING
            </div>

            <h1>
              Big progress starts with <em>small steps.</em>
            </h1>

            <p>
              One-on-one online tutoring, friendly guidance, and clear
              updates so families can celebrate every win.
            </p>

            <div className="hero-buttons">
              <a
                className="button button-large"
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                  "LessonBilly tutoring inquiry"
                )}`}
              >
                Ask About Tutoring <ArrowRight size={18} />
              </a>

              <button
                className="button-ghost"
                onClick={() => {
                  setPage("auth");
                  window.scrollTo(0, 0);
                }}
              >
                Learning Portal <ChevronRight size={18} />
              </button>
            </div>

            <div className="hero-trust">
              <span>
                <CheckCircle2 size={17} /> 100% online
              </span>

              <span>
                <CheckCircle2 size={17} /> Personal attention
              </span>

              <span>
                <CheckCircle2 size={17} /> Progress tracking
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
                  <small>A little progress, every week</small>
                </span>

                <span className="online-pill">● On track</span>
              </div>

              <div className="mock-stats">
                <div>
                  <small>Practice score</small>
                  <strong>88%</strong>
                  <span className="positive">↗ Growing</span>
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
                  {[38, 50, 43, 61, 72, 64, 88].map((n, i) => (
                    <span
                      key={i}
                      style={{ height: `${n}%` }}
                    />
                  ))}
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
                <small>Your effort is paying off.</small>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="shell trust-items">
          <span>
            <ShieldCheck size={20} />
            Private student and parent portals
          </span>

          <span>
            <Video size={20} />
            Convenient online lessons
          </span>

          <span>
            <TrendingUp size={20} />
            Track improvement over time
          </span>
        </div>
      </section>

      <section className="section" id="subjects">
        <div className="shell">
          <motion.div {...fadeIn} className="section-intro">
            <span className="section-kicker">WHAT WE SUPPORT</span>
            <h2>Learning support for every stage.</h2>
            <p>
              Focused, patient tutoring that meets students where they are.
            </p>
          </motion.div>

          <div className="subject-grid">
            {subjects.map(({ icon: Icon, title, text }, i) => (
              <motion.article
                {...fadeIn}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1
                }}
                className="subject-card"
                key={title}
              >
                <div className="subject-icon">
                  <Icon size={27} />
                </div>

                <h3>{title}</h3>
                <p>{text}</p>

                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                    "Question about " + title
                  )}`}
                >
                  Ask about subjects <ArrowRight size={16} />
                </a>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft-section" id="how-it-works">
        <div className="shell">
          <motion.div {...fadeIn} className="section-intro">
            <span className="section-kicker">
              SIMPLE FROM DAY ONE
            </span>

            <h2>How LessonBilly works</h2>

            <p>
              Stay focused on learning, not complicated technology.
            </p>
          </motion.div>

          <div className="steps-grid">
            {[
              {
                n: "01",
                title: "Get in touch",
                text: "Tell me the student's grade level and the subject they need help with."
              },
              {
                n: "02",
                title: "Meet online",
                text: "Join your tutoring session using the private meeting link."
              },
              {
                n: "03",
                title: "See the progress",
                text: "Log in to review published assessment scores and feedback."
              }
            ].map(s => (
              <motion.div
                {...fadeIn}
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

      <section className="section" id="pricing">
        <div className="shell pricing-layout">
          <motion.div {...fadeIn}>
            <span className="section-kicker">
              STRAIGHTFORWARD PRICING
            </span>

            <h2>Great tutoring. Clear pricing.</h2>

            <p className="pricing-lead">
              A simple hourly rate, with a recommended weekly routine
              to help students build confidence and consistency.
            </p>

            <div className="pricing-point">
              <CheckCircle2 size={20} />
              One-on-one remote tutoring
            </div>

            <div className="pricing-point">
              <CheckCircle2 size={20} />
              Parent access to published grades
            </div>

            <div className="pricing-point">
              <CheckCircle2 size={20} />
              No required long-term contract
            </div>
          </motion.div>

          <motion.div {...fadeIn} className="price-card">
            <span className="price-label">
              PERSONALIZED TUTORING
            </span>

            <div className="price">
              <strong>$25</strong>
              <span>/ hour</span>
            </div>

            <div className="price-divider" />

            <p>
              Recommended: 2 hours per week, per subject
            </p>

            <div className="price-summary">
              <span>Estimated weekly cost (2 hours)</span>
              <b>$50</b>
            </div>

            <a
              className="button button-large button-full"
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                "I am interested in LessonBilly tutoring"
              )}`}
            >
              Get Started <ArrowRight size={18} />
            </a>

            <small>
              Subject availability is confirmed before booking.
            </small>
          </motion.div>
        </div>
      </section>

      <section className="section soft-section" id="about">
        <div className="shell pricing-layout">
          <motion.div {...fadeIn}>
            <span className="section-kicker">
              ABOUT LESSONBILLY
            </span>

            <h2>Patient teaching. Clear progress.</h2>

            <p>
              LessonBilly is an independent online tutoring service built
              around understandable explanations, consistent practice,
              and helpful feedback for families.
            </p>

            <p>
              Rather than promising instant results, the focus is on
              building confidence one lesson at a time.
            </p>
          </motion.div>

          <motion.div {...fadeIn} className="panel">
            <div className="pricing-point">
              <ShieldCheck size={20} />
              Private student and parent dashboards
            </div>

            <div className="pricing-point">
              <BookOpen size={20} />
              Lessons tailored to the student
            </div>

            <div className="pricing-point">
              <TrendingUp size={20} />
              Visible assessment updates
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section cta-section">
        <motion.div
          {...fadeIn}
          className="shell cta-content"
        >
          <Sparkles size={26} />

          <h2>Ready to make learning click?</h2>

          <p>
            Tell me what your student is working on.
            We'll start with a simple plan.
          </p>

          <a
            className="button button-light"
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
              "LessonBilly - New tutoring student"
            )}`}
          >
            Contact LessonBilly <ArrowRight size={18} />
          </a>
        </motion.div>
      </section>
    </main>
  );
}

function PortalAuthCard({ role, onSuccess }) {
  const isStudent = role === "student";

  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [guardianApproved, setGuardianApproved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      if (register) {
        if (password.length < 8) {
          throw new Error(
            "Use a password with at least 8 characters."
          );
        }

        if (isStudent && !guardianApproved) {
          throw new Error(
            "A parent or guardian must approve the student account."
          );
        }

        const result = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        await updateProfile(result.user, {
          displayName: name.trim()
        });

        // Save role during registration.
        // The Firestore rules restrict this profile to its owner.
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

        onSuccess();
      } else {
        const result = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        if (
          result.user.emailVerified &&
          result.user.uid !== TUTOR_UID
        ) {
          await result.user.getIdToken(true);

          const profile = await getDoc(
            doc(db, "profiles", result.user.uid)
          );

          const actualRole =
            profile.data()?.role === "student"
              ? "student"
              : "parent";

          if (actualRole !== role) {
            await signOut(auth);

            throw new Error(
              `This is a ${actualRole} account. Please use ${
                actualRole === "student"
                  ? "Student Sign In"
                  : "Parent Sign In"
              }.`
            );
          }
        }

        onSuccess();
      }
    } catch (error) {
      setMessage(readableError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-card portal-auth-card">
      <div className="auth-icon">
        {isStudent ? (
          <GraduationCap size={24} />
        ) : (
          <Users size={24} />
        )}
      </div>

      <h2>
        {register
          ? `Create ${isStudent ? "student" : "parent"} account`
          : `${isStudent ? "Student" : "Parent"} Sign In`}
      </h2>

      <p>
        {register
          ? isStudent
            ? "A parent or guardian should help set up this student account."
            : "Create an account to follow your child's learning."
          : isStudent
            ? "Access your lessons, scores, and tutor feedback."
            : "Follow your child's grades and upcoming lessons."}
      </p>

      <form className="stack-form" onSubmit={submit}>
        {register && (
          <label>
            Full name
            <input
              required
              maxLength={80}
              placeholder="Full name"
              autoComplete="name"
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
            placeholder="name@example.com"
            autoComplete="email"
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
            placeholder="Your password"
            autoComplete={
              register ? "new-password" : "current-password"
            }
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>

        {register && isStudent && (
          <label className="guardian-confirm">
            <input
              type="checkbox"
              checked={guardianApproved}
              onChange={e =>
                setGuardianApproved(e.target.checked)
              }
            />

            <span>
              A parent or guardian approves this student account.
            </span>
          </label>
        )}

        <button
          className="button button-full"
          disabled={busy}
          type="submit"
        >
          {busy
            ? "Please wait..."
            : register
              ? "Create account"
              : "Sign in"}

          <ArrowRight size={17} />
        </button>
      </form>

      {message && (
        <div className="form-notice" role="status">
          {message}
        </div>
      )}

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
            setMessage("");
          }}
        >
          {register
            ? "Back to sign in"
            : `Create ${isStudent ? "Student" : "Parent"} Account`}

          <ArrowRight size={17} />
        </button>
      </div>

      {isStudent && (
        <p className="student-account-note">
          
        </p>
      )}

      {!isStudent && (
        <p className="student-account-note">
        </p>
      )}
    </section>
  );
}

function AuthScreen({ onSuccess }) {
  return (
    <main className="auth-page">
      <style>{`
        .portal-auth-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
          align-items: start;
          max-width: 1050px;
        }

        .portal-auth-card {
          height: 100%;
          min-width: 0;
        }

        .portal-auth-card h2 {
          font-size: 26px;
        }

        .create-account-area {
          margin-top: 23px;
          padding-top: 20px;
          border-top: 1px solid #e5ebf8;
          display: flex;
          flex-direction: column;
          gap: 11px;
          align-items: stretch;
        }

        .create-account-area span {
          font-size: 13px;
          text-align: center;
          font-weight: 700;
          color: #53627e;
        }

        .create-account-button {
          background: #edf2ff !important;
          color: #345bc7 !important;
          border: 2px solid #8ba7f5 !important;
          box-shadow: none !important;
          white-space: normal !important;
        }

        .create-account-button:hover {
          background: #e0e9ff !important;
        }

        .student-account-note {
          margin: 17px 0 0 !important;
          color: #7a8aa5;
          font-size: 12px !important;
          line-height: 1.6;
        }

        .guardian-confirm {
          flex-direction: row !important;
          align-items: flex-start;
          gap: 9px !important;
          font-weight: 500 !important;
          line-height: 1.5;
        }

        .guardian-confirm input {
          width: auto !important;
          margin-top: 3px;
          flex-shrink: 0;
        }

        @media (max-width: 800px) {
          .portal-auth-grid {
            grid-template-columns: 1fr;
            max-width: 550px;
          }

          .portal-auth-card {
            height: auto;
          }
        }
      `}</style>

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

        <h1
          style={{
            fontSize: "clamp(29px,3.4vw,42px)",
            margin: "12px 0"
          }}
        >
          Welcome to LessonBilly
        </h1>

        <p style={{ margin: 0 }}>
          Choose the sign-in option for your account.
        </p>
      </div>

      <div className="shell portal-auth-grid">
        <PortalAuthCard
          role="student"
          onSuccess={onSuccess}
        />

        <PortalAuthCard
          role="parent"
          onSuccess={onSuccess}
        />
      </div>
    </main>
  );
}

function VerificationScreen({ user, onVerified }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function check() {
    setBusy(true);
    setMessage("");

    try {
      await reload(user);
      await user.getIdToken(true);

      if (!user.emailVerified) {
        setMessage(
          "Not verified yet. Open the link in your email first."
        );
        return;
      }

      await ensureProfile(user);
      onVerified();
    } catch (error) {
      setMessage(readableError(error));
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setBusy(true);

    try {
      await sendEmailVerification(user);

      setMessage(
        "Verification email sent. Check your inbox and spam folder."
      );
    } catch (error) {
      setMessage(readableError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="shell verify-wrap">
        <div className="auth-card">
          <Mail className="verify-symbol" size={34} />

          <h2>Verify your email</h2>

          <p>
            We sent a confirmation link to{" "}
            <strong>{user.email}</strong>.
            Open it, then return here.
          </p>

          <button
            className="button button-full"
            onClick={check}
            disabled={busy}
          >
            I've verified my email <CheckCircle2 size={18} />
          </button>

          <button
            className="text-button"
            onClick={resend}
            disabled={busy}
          >
            Resend verification email
          </button>

          {message && (
            <div className="form-notice" role="status">
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function GradeList({ grades, tutor = false, onPublish }) {
  if (!grades.length) {
    return (
      <div className="empty-small">
        No {tutor ? "assessments" : "published grades"} yet.
      </div>
    );
  }

  return (
    <div className="grade-list">
      {grades.map(g => (
        <div className="grade-item" key={g.id}>
          <div className="grade-circle">
            {Math.round((g.earned / g.possible) * 100)}%
          </div>

          <div className="grade-description">
            <strong>{g.title}</strong>

            <small>
              {g.earned} / {g.possible} points
              {g.feedback ? ` · ${g.feedback}` : ""}
            </small>
          </div>

          {tutor && !g.published ? (
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

function StudentTabs({ students, selectedId, setSelectedId }) {
  if (!students.length) return null;

  return (
    <div className="student-tabs">
      {students.map(s => (
        <button
          className={selectedId === s.id ? "selected" : ""}
          key={s.id}
          onClick={() => setSelectedId(s.id)}
        >
          {s.name}
        </button>
      ))}
    </div>
  );
}

function LearnerDashboard({ user, role }) {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "students"),
      where(
        role === "student" ? "studentUids" : "parentUids",
        "array-contains",
        user.uid
      )
    );

    return onSnapshot(
      q,
      snapshot => {
        setStudents(
          snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
          }))
        );
      },
      e => setError(readableError(e))
    );
  }, [user.uid, role]);

  useEffect(() => {
    if (!students.find(s => s.id === selectedId)) {
      setSelectedId(students[0]?.id || "");
    }
  }, [students, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setGrades([]);
      return;
    }

    const q = query(
      collection(db, "students", selectedId, "grades"),
      where("published", "==", true)
    );

    return onSnapshot(
      q,
      snapshot => {
        setGrades(
          snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
          }))
        );
      },
      e => setError(readableError(e))
    );
  }, [selectedId]);

  const selected = students.find(s => s.id === selectedId);

  const sum = grades.reduce(
    (acc, g) => ({
      earned: acc.earned + g.earned,
      possible: acc.possible + g.possible
    }),
    { earned: 0, possible: 0 }
  );

  return (
    <div className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <span className="section-kicker">
            {role === "student"
              ? "STUDENT PORTAL"
              : "PARENT PORTAL"}
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

        <div className="secure-chip">
          <LockKeyhole size={16} />
          Private access
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      {!students.length ? (
        <div className="panel empty-panel">
          <Users size={35} />

          <h2>Your account is ready.</h2>

          <p>
            Your tutor will connect your account to a student
            record after confirming your email.
            No grades are visible yet.
          </p>

          <div className="hint-box">
            Your email: <strong>{user.email}</strong>
          </div>
        </div>
      ) : (
        <>
          <StudentTabs
            students={students}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
          />

          <div className="metric-grid">
            <div className="metric">
              <small>Published assessments</small>
              <strong>{grades.length}</strong>
              <span>View all results below</span>
            </div>

            <div className="metric">
              <small>Overall score</small>

              <strong>
                {sum.possible
                  ? `${Math.round(
                      (sum.earned / sum.possible) * 100
                    )}%`
                  : "-"}
              </strong>

              <span>
                Points earned across assessments
              </span>
            </div>

            <div className="metric">
              <small>Subject</small>

              <strong className="metric-subject">
                {selected?.subject || "-"}
              </strong>

              <span>
                {selected?.gradeLevel || "Learning support"}
              </span>
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

              <GradeList grades={grades} />
            </section>

            <section className="panel">
              <div className="panel-heading">
                <h2>Next tutoring session</h2>
              </div>

              <p className="schedule-date">
                {formatDate(selected?.nextLessonAt)}
              </p>

              <p className="muted">
                {formatLessonDuration(
                  selected?.durationMinutes
                )} planned session
              </p>

              {selected?.meetingUrl ? (
                <a
                  className="button button-full"
                  href={selected.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Google Meet <Video size={18} />
                </a>
              ) : (
                <div className="empty-small">
                  Your tutor hasn't provided a meeting link.
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function TutorDashboard({ user }) {
  const [students, setStudents] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const [newStudent, setNewStudent] = useState({
    name: "",
    parentEmail: "",
    gradeLevel: "",
    subject: ""
  });

  const [newGrade, setNewGrade] = useState({
    title: "",
    earned: "",
    possible: "",
    feedback: ""
  });

  const [session, setSession] = useState({
    meetingUrl: "",
    lessonAt: "",
    durationMinutes: 60
  });

  const [studentEmail, setStudentEmail] = useState("");
  const [linkEmail, setLinkEmail] = useState("");

  useEffect(() => {
    const unsubStudents = onSnapshot(
      collection(db, "students"),
      snapshot => {
        setStudents(
          snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
          }))
        );
      },
      e => setError(readableError(e))
    );

    const unsubProfiles = onSnapshot(
      collection(db, "profiles"),
      snapshot => {
        setProfiles(
          snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
          }))
        );
      },
      e => setError(readableError(e))
    );

    return () => {
      unsubStudents();
      unsubProfiles();
    };
  }, []);

  useEffect(() => {
    if (!students.find(s => s.id === selectedId)) {
      setSelectedId(students[0]?.id || "");
    }
  }, [students, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setGrades([]);
      return;
    }

    return onSnapshot(
      collection(db, "students", selectedId, "grades"),
      snapshot => {
        setGrades(
          snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
          }))
        );
      },
      e => setError(readableError(e))
    );
  }, [selectedId]);

  const selected = students.find(
    s => s.id === selectedId
  );

  useEffect(() => {
    setSession({
      meetingUrl: selected?.meetingUrl || "",
      lessonAt: toLocalInput(selected?.nextLessonAt),
      durationMinutes: normalizedLessonMinutes(
        selected?.durationMinutes
      )
    });
  }, [
    selectedId,
    selected?.meetingUrl,
    selected?.nextLessonAt,
    selected?.durationMinutes
  ]);

  useEffect(() => {
    setLinkEmail(selected?.studentEmail || "");
  }, [
    selectedId,
    selected?.studentEmail
  ]);

  const sortedGrades = [...grades].sort(
    (a, b) =>
      (b.createdAt?.seconds || 0) -
      (a.createdAt?.seconds || 0)
  );

  async function createStudent(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    try {
      const email = newStudent.parentEmail
        .trim()
        .toLowerCase();

      const parent = profiles.find(
        p =>
          p.email?.toLowerCase() === email &&
          p.role !== "student"
      );

      if (!parent) {
        throw new Error(
          "That parent hasn't completed registration and email verification yet. Ask them to sign up first."
        );
      }

      const registeredStudent = studentEmail.trim()
        ? profiles.find(
            p =>
              p.email?.toLowerCase() ===
                studentEmail.trim().toLowerCase() &&
              p.role === "student"
          )
        : null;

      if (studentEmail.trim() && !registeredStudent) {
        throw new Error(
          "Student account not found. Ask the student and guardian to register and verify their email first, or leave this blank and link it later."
        );
      }

      const ref = await addDoc(
        collection(db, "students"),
        {
          name: newStudent.name.trim(),
          parentEmail: email,
          parentUids: [parent.id],
          studentUids: registeredStudent
            ? [registeredStudent.id]
            : [],
          studentEmail:
            registeredStudent?.email || "",
          gradeLevel: newStudent.gradeLevel.trim(),
          subject: newStudent.subject.trim(),
          meetingUrl: "",
          nextLessonAt: "",
          durationMinutes: 60,
          createdAt: serverTimestamp()
        }
      );

      setSelectedId(ref.id);
      setStudentEmail("");

      setNewStudent({
        name: "",
        parentEmail: "",
        gradeLevel: "",
        subject: ""
      });

      setNotice(
        "Student added and connected to the parent."
      );
    } catch (e) {
      setError(readableError(e));
    } finally {
      setBusy(false);
    }
  }

  async function linkStudentAccount(event) {
    event.preventDefault();

    setError("");
    setNotice("");
    setBusy(true);

    try {
      const email = linkEmail.trim().toLowerCase();

      if (!email) {
        await updateDoc(
          doc(db, "students", selectedId),
          {
            studentUids: [],
            studentEmail: ""
          }
        );

        setNotice("Student sign-in access unlinked.");
      } else {
        const studentProfile = profiles.find(
          p =>
            p.email?.toLowerCase() === email &&
            p.role === "student"
        );

        if (!studentProfile) {
          throw new Error(
            "No student profile found with that email. Have the student register and verify first."
          );
        }

        await updateDoc(
          doc(db, "students", selectedId),
          {
            studentUids: [studentProfile.id],
            studentEmail: email
          }
        );

        setNotice(
          "Student account linked. The student can now see their own records after email verification."
        );
      }
    } catch (e) {
      setError(readableError(e));
    } finally {
      setBusy(false);
    }
  }

  async function addGrade(event) {
    event.preventDefault();

    setError("");
    setNotice("");
    setBusy(true);

    try {
      const earned = Number(newGrade.earned);
      const possible = Number(newGrade.possible);

      if (
        !Number.isFinite(earned) ||
        !Number.isFinite(possible) ||
        earned < 0 ||
        possible <= 0 ||
        earned > possible
      ) {
        throw new Error(
          "Enter valid points. Earned points cannot exceed possible points."
        );
      }

      await addDoc(
        collection(
          db,
          "students",
          selectedId,
          "grades"
        ),
        {
          title: newGrade.title.trim(),
          earned,
          possible,
          feedback: newGrade.feedback.trim(),
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

      setNotice(
        "Assessment saved as a private draft."
      );
    } catch (e) {
      setError(readableError(e));
    } finally {
      setBusy(false);
    }
  }

  async function publishGrade(gradeId) {
    if (
      !window.confirm(
        "Publish this score so the student and parent can view it?"
      )
    ) {
      return;
    }

    setError("");
    setNotice("");

    try {
      await updateDoc(
        doc(
          db,
          "students",
          selectedId,
          "grades",
          gradeId
        ),
        {
          published: true,
          publishedAt: serverTimestamp()
        }
      );

      setNotice(
        "Score published. No email was automatically sent."
      );
    } catch (e) {
      setError(readableError(e));
    }
  }

  async function saveSession(event) {
    event.preventDefault();

    setError("");
    setNotice("");
    setBusy(true);

    try {
      if (session.meetingUrl) {
        const url = new URL(session.meetingUrl);

        if (
          url.protocol !== "https:" ||
          url.hostname !== "meet.google.com"
        ) {
          throw new Error(
            "Please paste a valid https://meet.google.com meeting link."
          );
        }
      }

      if (
        session.lessonAt &&
        Number.isNaN(
          new Date(session.lessonAt).getTime()
        )
      ) {
        throw new Error(
          "Enter a valid lesson date."
        );
      }

      await updateDoc(
        doc(db, "students", selectedId),
        {
          meetingUrl: session.meetingUrl.trim(),
          nextLessonAt: session.lessonAt
            ? new Date(
                session.lessonAt
              ).toISOString()
            : "",
          durationMinutes: Number(
            session.durationMinutes
          )
        }
      );

      setNotice(
        "Lesson details saved for student and parent portals."
      );
    } catch (e) {
      setError(readableError(e));
    } finally {
      setBusy(false);
    }
  }

  function emailParent() {
    if (!selected) return;

    const subject =
      `LessonBilly - New progress update for ${selected.name}`;

    const body =
      `Hello,\n\nA new assessment result for ${selected.name} is available in your LessonBilly parent portal.\n\nPlease sign in at ${window.location.origin} to view it.\n\nThank you,\nLessonBilly`;

    window.location.href =
      `mailto:${encodeURIComponent(selected.parentEmail)}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <span className="section-kicker">
            TUTOR WORKSPACE
          </span>

          <h1>
            Good to see you, {user.displayName || "Tutor"}.
          </h1>

          <p>
            Manage your students, assessment results,
            and tutoring links.
          </p>
        </div>

        <span className="secure-chip">
          <ShieldCheck size={17} />
          Tutor access
        </span>
      </div>

      {error && (
        <div className="alert">
          {error}
        </div>
      )}

      {notice && (
        <div className="success-note" role="status">
          {notice}
        </div>
      )}

      <div className="metric-grid">
        <div className="metric">
          <small>Students</small>
          <strong>{students.length}</strong>
          <span>Connected learners</span>
        </div>

        <div className="metric">
          <small>Registered accounts</small>
          <strong>{profiles.length}</strong>
          <span>Including your account</span>
        </div>

        <div className="metric">
          <small>Notifications</small>
          <strong className="metric-subject">
            Manual
          </strong>
          <span>No automatic grade emails</span>
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

          <p className="muted">
            A parent must register and verify their email first.
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
                placeholder="e.g. Jordan Smith"
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
                placeholder="parent@example.com"
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
              Student's registered email (optional)
              <input
                type="email"
                placeholder="student@example.com"
                value={studentEmail}
                onChange={e =>
                  setStudentEmail(e.target.value)
                }
              />

              <small className="muted">
                Student accounts must register and verify
                first. You can link one later.
              </small>
            </label>

            <div className="form-pair">
              <label>
                Grade level
                <input
                  required
                  maxLength={30}
                  placeholder="e.g. Grade 8"
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
                Subject
                <input
                  required
                  maxLength={60}
                  placeholder="e.g. Algebra"
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

          {!students.length ? (
            <div className="empty-small">
              No students yet. Add your first student
              using the form.
            </div>
          ) : (
            <div className="student-list">
              {students.map(s => (
                <button
                  key={s.id}
                  className={
                    selectedId === s.id
                      ? "student-row active"
                      : "student-row"
                  }
                  onClick={() => setSelectedId(s.id)}
                >
                  <span className="student-avatar">
                    {s.name.charAt(0).toUpperCase()}
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
          )}
        </section>
      </div>

      {selected && (
        <>
          <div className="section-divider">
            <h2>Manage {selected.name}</h2>
            <span>{selected.parentEmail}</span>
          </div>

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

            <p className="muted">
              Link this student record to a separate
              student login. Parents keep their own login.
            </p>

            <form
              className="stack-form"
              onSubmit={linkStudentAccount}
            >
              <label>
                Student account email
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={linkEmail}
                  onChange={e =>
                    setLinkEmail(e.target.value)
                  }
                />
              </label>

              <button
                className="button"
                disabled={busy}
                type="submit"
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
                  Add an assessment
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
                    placeholder="e.g. Fractions quiz"
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
                    placeholder="What went well? What should we practice?"
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
                grades={sortedGrades}
                tutor
                onPublish={publishGrade}
              />

              <p className="muted tiny">
                Only published scores appear in student
                and parent accounts. Email Parent opens
                your email app; it does not send automatically.
              </p>
            </section>
          </div>

          <section className="panel session-panel">
            <div className="panel-heading">
              <h2>Upcoming lesson</h2>
            </div>

            <form
              className="session-form"
              onSubmit={saveSession}
            >
              <label>
                Google Meet link
                <input
                  type="url"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={session.meetingUrl}
                  onChange={e =>
                    setSession({
                      ...session,
                      meetingUrl: e.target.value
                    })
                  }
                />
              </label>

              <label>
                Lesson date and time
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
                  <option value="60">1 hour</option>
                  <option value="90">1 hour 30 minutes</option>
                  <option value="120">2 hours</option>
                  <option value="150">2 hours 30 minutes</option>
                  <option value="180">3 hours</option>
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
              The meeting is hosted in Google Meet.
              LessonBilly shows the planned duration
              but does not limit the meeting length.
            </p>
          </section>
        </>
      )}
    </div>
  );
}

function PrivacyScreen() {
  return (
    <main className="section">
      <div className="shell privacy-page">
        <span className="section-kicker">
          LESSONBILLY
        </span>

        <h1>Privacy information</h1>

        <p>
          LessonBilly collects parent account details,
          student names, subjects, grades, and lesson
          information to provide tutoring and a private
          progress portal. Firebase processes account
          and grade information, and Google Meet handles
          live lessons.
        </p>

        <p>
          Parents can request corrections or deletion
          of their family's records by contacting
          LessonBilly. Grades are not made public,
          and results are not emailed automatically.
          Lesson recordings are optional, require
          advance permission, and are not stored
          in Firebase through this website.
        </p>

        <p>
          Before providing the service to children,
          review applicable child-privacy laws and obtain
          appropriate parental consent. This starter
          statement should be reviewed and completed
          for your actual business practices before
          you enroll real students.
        </p>

        <a
          className="button"
          href={`mailto:${CONTACT_EMAIL}`}
        >
          Privacy questions <Mail size={16} />
        </a>
      </div>
    </main>
  );
}

function Footer({ setPage }) {
  return (
    <footer className="footer">
      <div className="shell footer-layout">
        <div>
          <Brand
            onClick={() => {
              setPage("home");
              window.scrollTo(0, 0);
            }}
          />

          <p>
            Personalized tutoring. Meaningful progress.
          </p>
        </div>

        <div>
          <span>Explore</span>

          <a
            href="/#subjects"
            onClick={() => setPage("home")}
          >
            Subjects
          </a>

          <a
            href="/#pricing"
            onClick={() => setPage("home")}
          >
            Pricing
          </a>

          <a
            href="/#about"
            onClick={() => setPage("home")}
          >
            About
          </a>
        </div>

        <div>
          <span>Connect</span>

          <a href={`mailto:${CONTACT_EMAIL}`}>
            Email LessonBilly
          </a>

          <button
            onClick={() => {
              setPage("auth");
              window.scrollTo(0, 0);
            }}
          >
            Portal login
          </button>

          <button
            onClick={() => {
              setPage("privacy");
              window.scrollTo(0, 0);
            }}
          >
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
  const [accountRole, setAccountRole] = useState("parent");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [startupError, setStartupError] = useState("");

  useEffect(
    () =>
      onAuthStateChanged(auth, async next => {
        setUser(next);
        setStartupError("");

        if (next) {
          try {
            await reload(next);
            await next.getIdToken(true);

            setVerified(next.emailVerified);

            if (next.emailVerified) {
              const role = await ensureProfile(next);

              setAccountRole(
                role === "student" ? "student" : "parent"
              );
            }
          } catch (e) {
            setStartupError(readableError(e));
          }
        } else {
          setVerified(false);
          setAccountRole("parent");
        }

        setLoading(false);
      }),
    []
  );

  const tutor =
    user?.uid === TUTOR_UID &&
    TUTOR_UID !== "PASTE_TUTOR_UID_HERE";

  async function logout() {
    await signOut(auth);
    setPage("home");
    window.scrollTo(0, 0);
  }

  function go(next) {
    setPage(next);
    window.scrollTo(0, 0);
  }

  return (
    <>
      <Header
        setPage={go}
        user={user}
        onLogout={logout}
      />

      {loading ? (
        <main className="loading-screen">
          <div className="loader" />
          <p>Loading LessonBilly...</p>
        </main>
      ) : page === "home" ? (
        <Home setPage={go} />
      ) : page === "privacy" ? (
        <PrivacyScreen />
      ) : user && !verified ? (
        <VerificationScreen
          user={user}
          onVerified={() => {
            setVerified(true);

            getDoc(
              doc(db, "profiles", user.uid)
            )
              .then(profile => {
                setAccountRole(
                  profile.data()?.role === "student"
                    ? "student"
                    : "parent"
                );

                go("dashboard");
              })
              .catch(() => go("dashboard"));
          }}
        />
      ) : page === "auth" && !user ? (
        <AuthScreen
          onSuccess={() => go("dashboard")}
        />
      ) : user ? (
        <main className="dashboard-page shell">
          {startupError && (
            <div className="alert">
              {startupError}
            </div>
          )}

          {tutor ? (
            <TutorDashboard user={user} />
          ) : (
            <LearnerDashboard
              user={user}
              role={accountRole}
            />
          )}
        </main>
      ) : (
        <AuthScreen
          onSuccess={() => go("dashboard")}
        />
      )}

      <Footer setPage={go} />
    </>
  );
}
