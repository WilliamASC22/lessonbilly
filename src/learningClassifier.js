// A lightweight Naive Bayes text classifier.
// Runs in the browser without WebGPU, API calls, or model downloads.
// Example training sentences are illustrative, not a validated assessment.

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

// Train once from the sample descriptions.
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
        model.totals[area] + model.vocabularySize;

      let score = Math.log(1 / model.labels.length);

      for (const word of words) {
        score += Math.log(
          ((model.counts[area][word] || 0) + 1) /
          denominator
        );
      }

      return { area, score };
    })
    .sort((a, b) => b.score - a.score);

  // This score difference is not a calibrated probability.
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

// These describe what tutoring sessions might involve.
// They are not student self-help plans or guaranteed results.
const TUTORING_APPROACHES = {
  math: {
    focus:
      "Work through the exact math skills that are causing difficulty.",
    sessionOne:
      "The tutor reviews recent problem types, identifies where the reasoning breaks down, and models a clear approach.",
    sessionTwo:
      "The tutor works through guided examples with the student, then checks their independent attempts and explains mistakes.",
    progress:
      "Class-specific worksheets, tutor-reviewed practice, and published assessment feedback."
  },
  reading: {
    focus:
      "Strengthen understanding of passages and reading assignments.",
    sessionOne:
      "The tutor reviews a passage with the student and checks which reading and comprehension tasks feel difficult.",
    sessionTwo:
      "The tutor models how to use evidence from a text, then provides guided reading practice and feedback.",
    progress:
      "Assigned reading materials, targeted flashcards, and parent-visible progress updates."
  },
  writing: {
    focus:
      "Make writing assignments easier to organize and revise.",
    sessionOne:
      "The tutor reviews a sample assignment and identifies a manageable writing skill to focus on.",
    sessionTwo:
      "The tutor coaches the student through a draft or revision and gives specific, constructive feedback.",
    progress:
      "Writing exercises, classwork PDFs, and published feedback on progress."
  },
  science: {
    focus:
      "Make challenging science topics clearer through worked examples.",
    sessionOne:
      "The tutor discusses the current unit, checks essential vocabulary, and identifies confusing concepts.",
    sessionTwo:
      "The tutor guides the student through diagrams, examples, and subject-specific practice questions.",
    progress:
      "Shared lesson materials, tutor-approved quizzes, and published feedback."
  },
  study: {
    focus:
      "Build a consistent approach to assignments and test preparation.",
    sessionOne:
      "The tutor reviews current assignments and helps identify the main obstacle to keeping up.",
    sessionTwo:
      "The tutor coaches study strategies during the session and helps the student apply them to actual coursework.",
    progress:
      "Scheduled lessons, shared materials, and clear updates for families."
  }
};

const GOALS = {
  homework: {
    label: "Keeping up with homework",
    emphasis:
      "Use current homework as the starting point for guided tutoring."
  },
  catch_up: {
    label: "Catching up in class",
    emphasis:
      "Identify missing foundations first, then work toward current class topics."
  },
  test: {
    label: "Preparing for a test",
    emphasis:
      "Prioritize the test topics and check understanding through guided practice."
  },
  confidence: {
    label: "Building confidence",
    emphasis:
      "Set manageable lesson goals and give feedback as the student practices."
  }
};

export const TUTORING_GOALS =
  Object.entries(GOALS).map(
    ([value, details]) => ({
      value,
      label: details.label
    })
  );

export function buildTutoringMatch({
  area,
  gradeLevel,
  challenge,
  goal,
  weeklyHours
}) {
  const subject =
    Object.hasOwn(TUTORING_APPROACHES, area)
      ? area
      : "study";

  const selectedGoal =
    Object.hasOwn(GOALS, goal)
      ? goal
      : "catch_up";

  const hours =
    [2, 3, 4].includes(Number(weeklyHours))
      ? Number(weeklyHours)
      : 2;

  return {
    area: subject,
    subject: AREA_LABELS[subject],
    gradeLevel: String(gradeLevel || "Not specified"),
    challenge: String(challenge || "").trim().slice(0, 400),
    goal: GOALS[selectedGoal].label,
    emphasis: GOALS[selectedGoal].emphasis,
    weeklyHours: hours,
    estimatedWeekly: hours * 25,
    ...TUTORING_APPROACHES[subject]
  };
}

export function formatTutoringInquiry(match) {
  return [
    "Hello,",
    "",
    "I'm interested in one-on-one remote tutoring through LessonBilly.",
    "",
    `Grade: ${match.gradeLevel}`,
    `Potential subject: ${match.subject}`,
    `Main goal: ${match.goal}`,
    `Learning challenge: ${match.challenge}`,
    `Preferred weekly tutoring time: ${match.weeklyHours} hours`,
    "",
    "Could you confirm whether you can help with this subject, your availability, and the best way to get started?",
    "",
    "Thank you"
  ].join("\n");
}
