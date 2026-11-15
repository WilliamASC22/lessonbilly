
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
  Sparkles,
  ListChecks
} from "lucide-react";

import LearningNeedsAssistant from "./LearningNeedsAssistant.jsx";

const features = [
  {
    label: "Practice Center",
    title: "Practice that a real tutor checks",
    description:
      "Flashcards and multiple-choice quizzes are reviewed by the tutor before students see them.",
    icon: GraduationCap,
    sample: "Math: 1/2 + 1/4 = ?",
    detail: "3/4 - reviewed answer"
  },
  {
    label: "Class materials",
    title: "Homework in one place",
    description:
      "Each class has its own homework and classwork PDFs linked from private Google Drive sharing.",
    icon: FileText,
    sample: "Homework: Fractions worksheet",
    detail: "Classwork: Lesson 4 practice"
  },
  {
    label: "Progress tracking",
    title: "See each step forward",
    description:
      "Families can view published assessment scores and feedback for each subject.",
    icon: BookOpen,
    sample: "Math: Fractions quiz",
    detail: "18 / 20 points - example score"
  },
  {
    label: "Online tutoring",
    title: "Join your next lesson easily",
    description:
      "Class-specific Google Meet links and lesson schedules are available in the learner's dashboard.",
    icon: Video,
    sample: "Next session: Math",
    detail: "Meeting link in the dashboard"
  },
  {
    label: "Tutor Match",
    title: "See how tutoring could help your student",
    description:
      "Describe a school challenge. Our lightweight AI suggests an appropriate subject and shows what working with a tutor could involve, then prepares a personal inquiry.",
    icon: ListChecks,
    sample: "Challenge: Fractions and word problems",
    detail: "Suggested: Grade 8 Math tutoring"
  }
];

export default function FeatureShowcase({ onTry }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || paused) return;

    const timer = setInterval(() => {
      setActive(i => (i + 1) % features.length);
    }, 4800);

    return () => clearInterval(timer);
  }, [reducedMotion, paused]);

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
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="section-kicker">
            <Sparkles size={14} />
            MORE THAN A VIDEO CALL
          </span>

          <h2>
            One place to learn, practice and grow.
          </h2>

          <p>
            See how LessonBilly supports students
            between sessions, then try our lightweight
            AI Tutoring Match Assistant.
          </p>
        </motion.div>

        <div
          className="lb-showcase"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
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
                  type="button"
                  role="tab"
                  aria-selected={index === active}
                  className={
                    index === active ? "active" : ""
                  }
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
                  reducedMotion
                    ? false
                    : { opacity: 0, y: 14 }
                }
                animate={{
                  opacity: 1,
                  y: 0
                }}
                exit={
                  reducedMotion
                    ? {}
                    : { opacity: 0, y: -10 }
                }
                transition={{ duration: 0.25 }}
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
                  Open learning portal
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <LearningNeedsAssistant />
      </div>

      <style>{`
        .lb-showcase {
          display: grid;
          grid-template-columns: 250px 1fr;
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
          font-size: 25px;
          margin: 16px 0 9px;
        }

        .lb-showcase-window p {
          font-size: 14px;
          color: #61738e;
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
            min-width: 170px;
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
