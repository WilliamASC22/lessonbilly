
 // A lightweight Naive Bayes text classifier.
 // Runs in the browser without WebGPU, API calls, or model downloads.
 // Example training sentences are illustrative, not a validated assessment.

const EXAMPLES = {
  math: [
    "struggling with fractions denominators numerators and mixed numbers",
    "need math help with decimals percentages ratios and proportions",
    "i cannot understand algebra equations unknown variables and functions",
    "multiplication and division word problems are hard",
    "geometry area perimeter angles shapes graphs and measurements are difficult",
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

  other: [
    "need tutoring in history and historical events",
    "struggling with geography maps and countries",
    "need help with social studies and government",
    "having trouble with economics and business",
    "need tutoring in computer science and programming",
    "struggling with spanish and foreign language classes",
    "need help with accounting and finance",
    "having trouble with psychology and sociology",
    "need help with college courses and assignments",
    "looking for tutoring in a different school subject"
  ]
};

// These labels appear in the subject dropdown.
// The keys must match the categories in EXAMPLES.

export const AREA_LABELS = {
  math: "Math",
  reading: "Reading",
  writing: "Writing",
  science: "Science",
  other: "Other"
};

// Convert text into individual words.

const tokenize = text =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(token => token.length > 2);

// Train the classifier using the example descriptions.

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

// Predict the likely tutoring subject from a description.

export function predictLearningArea(description) {
  const words = tokenize(description).slice(0, 90);

  if (words.length < 2) {
    return {
      area: "other",
      uncertain: true,
      rankings: []
    };
  }

  const scores = model.labels
    .map(area => {
      const denominator =
        model.totals[area] + model.vocabularySize;

      let score = Math.log(
        1 / model.labels.length
      );

      for (const word of words) {
        score += Math.log(
          ((model.counts[area][word] || 0) + 1) /
          denominator
        );
      }

      return {
        area,
        score
      };
    })
    .sort((a, b) => b.score - a.score);

  // The score difference is not a calibrated probability.

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

// These are examples of what tutoring sessions could involve.
// They are not guaranteed results or independent study plans.

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

  other: {
    focus:
      "Discuss the student's specific subject and determine whether one-on-one tutoring is available.",

    sessionOne:
      "The tutor reviews the course topic, current assignments, and the student's main difficulties.",

    sessionTwo:
      "If the subject is within the tutor's expertise, the tutor provides guided instruction and targeted practice.",

    progress:
      "Subject-specific materials, tutor-reviewed practice, and published feedback where appropriate."
  }
};

// Tutoring goals available to prospective clients.

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

// Format the goals for the dropdown.

export const TUTORING_GOALS =
  Object.entries(GOALS).map(
    ([value, details]) => ({
      value,
      label: details.label
    })
  );

// Build a tutoring match using the selected subject,
// grade level, learning challenge, goal, and weekly hours.

export function buildTutoringMatch({
  area,
  gradeLevel,
  challenge,
  goal,
  weeklyHours,
  otherSubject = ""
}) {
  const subject =
    Object.hasOwn(TUTORING_APPROACHES, area)
      ? area
      : "other";

  const selectedGoal =
    Object.hasOwn(GOALS, goal)
      ? goal
      : "catch_up";

  const hours =
    [2, 3, 4].includes(Number(weeklyHours))
      ? Number(weeklyHours)
      : 2;

  // If Other was selected, use the subject
  // that the prospective client typed.

  const subjectName =
    subject === "other"
      ? String(otherSubject).trim().slice(0, 60) || "Other"
      : AREA_LABELS[subject];

  return {
    area: subject,

    subject: subjectName,

    gradeLevel:
      String(gradeLevel || "Not specified"),

    challenge:
      String(challenge || "")
        .trim()
        .slice(0, 400),

    goal:
      GOALS[selectedGoal].label,

    emphasis:
      GOALS[selectedGoal].emphasis,

    weeklyHours: hours,

    estimatedWeekly: hours * 25,

    ...TUTORING_APPROACHES[subject]
  };
}

// Prepare the tutoring inquiry email.
// The visitor must choose to send it manually.

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
