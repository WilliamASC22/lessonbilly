
import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion
} from "motion/react";
import {
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  Video,
  Sparkles
} from "lucide-react";

const features = [
  {
    label: "Practice Center",
    title: "Tutor-approved practice",
    description:
      "Flashcards and multiple-choice quizzes, reviewed by your tutor before students see them.",
    icon: GraduationCap,
    sample: "Q: 1/2 + 1/4 = ?",
    detail: "Answer: 3/4 · Practice with feedback"
  },
  {
    label: "Class materials",
    title: "Homework in one place",
    description:
      "A private homework link and classwork link for each class, shared using Google Drive.",
    icon: FileText,
    sample: "Homework · Fractions worksheet",
    detail: "Classwork · Lesson 4 practice"
  },
  {
    label: "Progress tracking",
    title: "See every improvement",
    description:
      "View published assessments, feedback and scores by class in a private portal.",
    icon: BookOpen,
    sample: "Math · Fractions quiz",
    detail: "18 / 20 points · 90%"
  },
  {
    label: "Online tutoring",
    title: "Join lessons from anywhere",
    description:
      "Class-specific Google Meet links and lesson times make tutoring easier to follow.",
    icon: Video,
    sample: "Next session · Math",
    detail: "Meet link available in your dashboard"
  }
];

export default function FeatureShowcase({ onTry }) {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const timer = setInterval(
      () => setActive(i => (i + 1) % features.length),
      4500
    );

    return () => clearInterval(timer);
  }, [reduced]);

  const feature = features[active];
  const Icon = feature.icon;

  return (
    <section
      className="section soft-section"
      id="practice-preview"
      aria-label="LessonBilly features"
    >
      <div className="shell">
        <motion.div
          className="section-intro"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="section-kicker">
            <Sparkles
              size={14}
              style={{ verticalAlign: "middle" }}
            />
            MORE THAN A VIDEO CALL
          </span>

          <h2>One place to learn, practice and grow.</h2>

          <p>
            Explore the features that help students build
            confidence between lessons.
          </p>
        </motion.div>

        <div className="lb-showcase">
          <div
            className="lb-showcase-tabs"
            role="tablist"
            aria-label="Explore LessonBilly features"
          >
            {features.map((item, index) => {
              const TabIcon = item.icon;

              return (
                <button
                  key={item.label}
                  role="tab"
                  aria-selected={index === active}
                  className={index === active ? "active" : ""}
                  onClick={() => setActive(index)}
                >
                  <TabIcon size={18} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="lb-showcase-window">
            <AnimatePresence mode="wait">
              <motion.div
                key={feature.label}
                initial={
                  reduced ? false : { opacity: 0, y: 16 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={
                  reduced ? {} : { opacity: 0, y: -12 }
                }
                transition={{ duration: 0.3 }}
              >
                <div className="lb-showcase-badge">
                  <Icon size={18} />
                  {feature.label}
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>

                <div className="lb-showcase-example">
                  <strong>{feature.sample}</strong>

                  <span>
                    <CheckCircle2 size={16} />
                    {feature.detail}
                  </span>
                </div>

                <button
                  className="button"
                  type="button"
                  onClick={onTry}
                >
                  Explore the learning portal
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        .lb-showcase {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 22px;
          max-width: 960px;
          margin: 0 auto;
        }

        .lb-showcase-tabs {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .lb-showcase-tabs button {
          display: flex;
          align-items: center;
          gap: 11px;
          text-align: left;
          border: 1px solid #dfe7f8;
          background: white;
          border-radius: 12px;
          padding: 16px;
          color: #53627e;
          font-weight: 800;
        }

        .lb-showcase-tabs button.active {
          color: #315bd0;
          border-color: #8ba7f5;
          background: #eaf0ff;
        }

        .lb-showcase-window {
          padding: 30px;
          min-height: 290px;
          background: white;
          border: 1px solid #e0e7f7;
          border-radius: 18px;
          box-shadow: 0 20px 40px #263f9e12;
        }

        .lb-showcase-window h3 {
          font-size: 26px;
          margin: 16px 0 9px;
        }

        .lb-showcase-window p {
          font-size: 14px;
        }

        .lb-showcase-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #4469d7;
          font-size: 12px;
          font-weight: 800;
        }

        .lb-showcase-example {
          display: flex;
          flex-direction: column;
          gap: 9px;
          border: 1px solid #e5ebf8;
          background: #f7f9ff;
          border-radius: 12px;
          padding: 15px;
          margin: 20px 0;
        }

        .lb-showcase-example strong {
          font-size: 15px;
        }

        .lb-showcase-example span {
          display: flex;
          gap: 7px;
          align-items: center;
          font-size: 12px;
          color: #169270;
        }

        @media (max-width: 700px) {
          .lb-showcase {
            grid-template-columns: 1fr;
          }

          .lb-showcase-tabs {
            flex-direction: row;
            overflow-x: auto;
          }

          .lb-showcase-tabs button {
            min-width: 165px;
            flex-shrink: 0;
          }

          .lb-showcase-window {
            padding: 21px;
          }
        }
      `}</style>
    </section>
  );
}
