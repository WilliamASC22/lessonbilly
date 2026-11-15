
const EXAMPLES = {
  math: [
    "struggling with fractions denominators numerators and mixed numbers",
    "need math help with decimals percentages ratios and proportions",
    "i cannot understand algebra equations unknown variables and functions",
    "multiplication and division word problems are hard",
    "geometry area perimeter angles shapes and graphs are difficult",
    "need practice with integers negative numbers and exponents",
    "my child has trouble solving math homework",
    "counting addition subtraction and arithmetic need work",
    "fractions and equivalent fractions confuse me",
    "math tests with equations and calculations are stressful"
  ],
  reading: [
    "reading comprehension and understanding passages is hard",
    "have trouble sounding out words when reading books",
    "cannot find the main idea in a story or passage",
    "reading fluency and vocabulary need improvement",
    "need practice summarizing paragraphs and answering reading questions",
    "difficulty understanding characters plot and theme",
    "child reads slowly and guesses unfamiliar words",
    "i struggle with nonfiction reading and context clues",
    "want better comprehension of long reading assignments",
    "reading aloud and decoding need more practice"
  ],
  writing: [
    "need help writing paragraphs essays and reports",
    "grammar punctuation and sentence structure are confusing",
    "cannot organize ideas into an introduction body and conclusion",
    "writing thesis statements and supporting arguments is hard",
    "spelling and editing my writing are challenging",
    "need help with topic sentences and transitions",
    "child struggles to write complete sentences",
    "writing assignments take a long time and ideas are disorganized",
    "need feedback on essay drafts and proofreading",
    "want to improve writing clarity and word choice"
  ],
  science: [
    "science homework about ecosystems energy and cells is difficult",
    "biology topics genetics photosynthesis and organisms confuse me",
    "need chemistry help with atoms molecules and reactions",
    "physics force motion electricity and gravity are hard",
    "science vocabulary and lab reports are challenging",
    "earth science rocks weather and planets need reviewing",
    "i need help understanding scientific experiments and hypotheses",
    "science tests cover matter the water cycle and ecosystems",
    "child has trouble with chemistry equations and periodic table",
    "need practice with biology diagrams and scientific concepts"
  ],
  study: [
    "i forget homework deadlines and need better organization",
    "need study skills focus planning and time management",
    "tests make me nervous and i do not know how to prepare",
    "homework takes forever because i get distracted",
    "need a weekly routine and better note taking",
    "cannot remember material for exams and quizzes",
    "need to build confidence and independent learning habits",
    "my backpack and assignments are disorganized",
    "need help staying on task and preparing for tests",
    "want to create a revision schedule and study plan"
  ]
};

export const AREA_LABELS = {
  math: "Math",
  reading: "Reading",
  writing: "Writing",
  science: "Science",
  study: "Study skills"
};

const tokenize = text =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(token => token.length > 2);

// Train a small Naive Bayes text classifier using
// illustrative, hand-labeled example descriptions.
const model = (() => {
  const labels = Object.keys(EXAMPLES);
  const counts = {};
  const totals = {};
  const vocab = new Set();

  for (const label of labels) {
    counts[label] = {};
    totals[label] = 0;

    for (const sentence of EXAMPLES[label]) {
      for (const word of tokenize(sentence)) {
        vocab.add(word);
        counts[label][word] =
          (counts[label][word] || 0) + 1;
        totals[label]++;
      }
    }
  }

  return {
    labels,
    counts,
    totals,
    vocabularySize: vocab.size
  };
})();

export function predictLearningArea(description) {
  const words = tokenize(description).slice(0, 90);

  if (words.length < 2) {
    return {
      area: "study",
      uncertain: true,
      rankings: []
    };
  }

  const scores = model.labels
    .map(area => {
      const denominator =
        model.totals[area] +
        model.vocabularySize;

      let score = Math.log(
        1 / model.labels.length
      );

      for (const word of words) {
        score += Math.log(
          ((model.counts[area][word] || 0) + 1) /
          denominator
        );
      }

      return { area, score };
    })
    .sort((a, b) => b.score - a.score);

  const recognized = words.some(word =>
    model.labels.some(label =>
      Boolean(model.counts[label][word])
    )
  );

  return {
    area: scores[0].area,
    uncertain:
      !recognized ||
      scores[0].score - scores[1].score < 0.7,
    rankings: scores.map(({ area }) => area)
  };
}

const PLANS = {
  math: {
    focus:
      "Work through examples, then practice similar problems independently.",
    first:
      "Identify one specific skill (such as fractions or algebra) and check understanding with five short problems.",
    second:
      "Practice two problem types, explain each step aloud, and review mistakes.",
    between:
      "Complete three short problems on two different days; mark where you got stuck."
  },
  reading: {
    focus:
      "Strengthen comprehension by reading short passages and explaining ideas.",
    first:
      "Read a short, age-appropriate passage and identify its main idea and two details.",
    second:
      "Practice summarizing a new passage and answering evidence-based questions.",
    between:
      "Read for 10 minutes on two days and write one sentence about the main idea."
  },
  writing: {
    focus:
      "Build clearer sentences and more organized paragraphs.",
    first:
      "Write a short paragraph with a topic sentence and two supporting details.",
    second:
      "Revise a paragraph for organization, grammar, and clarity.",
    between:
      "Write one short paragraph and highlight a sentence you want feedback on."
  },
  science: {
    focus:
      "Use simple explanations, diagrams, and retrieval practice to learn concepts.",
    first:
      "Choose one topic and explain five key terms in your own words.",
    second:
      "Apply the terms to an example or a labeled diagram, then self-check.",
    between:
      "Review five important terms on two days and draw one simple diagram."
  },
  study: {
    focus:
      "Create a realistic study routine and build independent learning habits.",
    first:
      "List upcoming assignments and make a manageable weekly study schedule.",
    second:
      "Practice active recall, short work intervals, and checking completed tasks.",
    between:
      "Try two 15-minute study sessions and note what helped you focus."
  }
};

export function makeStarterPlan({
  area,
  gradeLevel,
  challenge
}) {
  const chosen = Object.hasOwn(PLANS, area)
    ? area
    : "study";

  return {
    area: chosen,
    subject: AREA_LABELS[chosen],
    gradeLevel: gradeLevel || "Not specified",
    challenge: String(challenge || "").trim(),
    ...PLANS[chosen]
  };
}

export function formatPlan(plan) {
  return [
    "LessonBilly - Tutoring starter plan",
    `Grade: ${plan.gradeLevel}`,
    `Suggested focus: ${plan.subject}`,
    `Learning challenge: ${plan.challenge}`,
    "",
    `Focus: ${plan.focus}`,
    `First session: ${plan.first}`,
    `Second session: ${plan.second}`,
    `Between sessions: ${plan.between}`,
    "",
    "This is a suggested starting point, not a test or assessment. A tutor will confirm the right approach."
  ].join("\n");
}
