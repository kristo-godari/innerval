// Global application state and localStorage persistence.

const STORAGE_KEY = 'values_quiz_progress';
const ASPIRATIONS_KEY = 'innerval_aspirations';

let currentIndex = 0;
const answers = {};
const skippedSet = new Set();
let aspirations = new Set();
let quizLevel = null; // 'essentials' | 'deep-dive' | 'full-spectrum'

// --- Area-based quiz state ---
let currentArea = null; // 'Work' | 'Relationships' | 'Personal' | 'Social' | 'Leisure'
let currentAreaPage = 0; // 0-based page index within current area

const LIFE_AREAS = ['Work', 'Relationships', 'Personal', 'Social', 'Leisure'];
const AREA_QUESTION_INDEX = { Work: 0, Relationships: 1, Personal: 2, Social: 3, Leisure: 4 };

// --- Quiz Level Configuration ---

const LEVEL_ESSENTIALS_NAMES = [
  'Accountability', 'Compassion', 'Equality', 'Family', 'Financial stability',
  'Freedom', 'Friendship', 'Growth', 'Health', 'Helpfulness', 'Honesty',
  'Independence', 'Inner harmony', 'Job security', 'Justice', 'Love',
  'Meaningful work', 'Peace', 'Respect', 'Security', 'Trust', 'Wisdom'
];

const LEVEL_DEEP_DIVE_NAMES = [
  ...LEVEL_ESSENTIALS_NAMES,
  'Acceptance', 'Authenticity', 'Competence', 'Contribution', 'Courage',
  'Creativity', 'Curiosity', 'Determination', 'Discipline', 'Ethics',
  'Forgiveness', 'Influence', 'Loyalty', 'Passion', 'Privacy',
  'Spirituality', 'Success', 'Teamwork', 'Tolerance', 'Variety'
];

const QUIZ_LEVELS = {
  essentials: {
    key: 'essentials',
    name: 'Essentials',
    subtitle: 'Core values that define who you are',
    valueNames: LEVEL_ESSENTIALS_NAMES,
    time: '10\u201315 min'
  },
  'deep-dive': {
    key: 'deep-dive',
    name: 'Deep Dive',
    subtitle: 'Extended values that shape your identity and drive',
    valueNames: LEVEL_DEEP_DIVE_NAMES,
    time: '20\u201325 min'
  },
  'full-spectrum': {
    key: 'full-spectrum',
    name: 'Full Spectrum',
    subtitle: 'Complete assessment of all 62 values',
    valueNames: null, // all values
    time: '30\u201345 min'
  }
};

// --- Active Level Helpers ---

function getActiveIndices() {
  if (!quizLevel || quizLevel === 'full-spectrum') {
    return VALUES_DATA.map(function(_, i) { return i; });
  }
  var level = QUIZ_LEVELS[quizLevel];
  if (!level || !level.valueNames) {
    return VALUES_DATA.map(function(_, i) { return i; });
  }
  var names = new Set(level.valueNames);
  var indices = [];
  VALUES_DATA.forEach(function(v, i) {
    if (names.has(v.name)) indices.push(i);
  });
  return indices;
}

function getActiveTotal() {
  return getActiveIndices().length;
}

function getActiveCompletedCount() {
  return getActiveIndices().reduce(function(n, vi) {
    return n + (isValueCompleted(vi) ? 1 : 0);
  }, 0);
}

function getActiveCompletedValues() {
  var activeSet = new Set(getActiveIndices());
  var completed = [];
  VALUES_DATA.forEach(function(v, vi) {
    if (activeSet.has(vi) && isValueCompleted(vi)) {
      var sum = 0;
      for (var qi = 0; qi < 5; qi++) {
        sum += answers[vi + '_' + qi] || 0;
      }
      completed.push({ name: v.name, avg: sum / 5 });
    }
  });
  completed.sort(function(a, b) { return b.avg - a.avg; });
  return completed;
}

function getActiveDetailedCompletedValues() {
  var activeSet = new Set(getActiveIndices());
  var completed = [];
  VALUES_DATA.forEach(function(v, vi) {
    if (activeSet.has(vi) && isValueCompleted(vi)) {
      var sum = 0;
      var questionScores = [];
      for (var qi = 0; qi < 5; qi++) {
        var score = answers[vi + '_' + qi] || 0;
        sum += score;
        questionScores.push({
          area: v.questions[qi].area,
          question: v.questions[qi].text,
          score: score
        });
      }
      completed.push({
        name: v.name,
        average: parseFloat((sum / 5).toFixed(2)),
        questions: questionScores
      });
    }
  });
  completed.sort(function(a, b) { return b.average - a.average; });
  return completed;
}

// --- Area-based Quiz Helpers ---

function getAreaQuestions(area) {
  var qi = AREA_QUESTION_INDEX[area];
  var activeIndices = getActiveIndices();
  return activeIndices.map(function(vi) {
    return {
      valueIndex: vi,
      questionIndex: qi,
      key: vi + '_' + qi,
      valueName: VALUES_DATA[vi].name,
      text: VALUES_DATA[vi].questions[qi].text
    };
  });
}

function getAreaAnsweredCount(area) {
  return getAreaQuestions(area).filter(function(q) { return !!answers[q.key]; }).length;
}

function isAreaComplete(area) {
  return getAreaQuestions(area).every(function(q) { return !!answers[q.key]; });
}

function getAllAreasComplete() {
  return LIFE_AREAS.every(isAreaComplete);
}

function getAreaPageCount(area) {
  return Math.ceil(getAreaQuestions(area).length / 5);
}

// --- Quiz Progress Storage ---

function saveProgress(screen) {
  const data = {
    answers: { ...answers },
    currentIndex,
    currentArea: currentArea,
    currentAreaPage: currentAreaPage,
    skipped: [...skippedSet],
    screen: screen || 'quiz',
    quizLevel: quizLevel
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) { /* storage full or unavailable */ }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}

function clearProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

// --- Aspirations Storage ---

function loadAspirations() {
  try {
    const raw = localStorage.getItem(ASPIRATIONS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) aspirations = new Set(arr);
    }
  } catch (e) { /* ignore */ }
}

function saveAspirations() {
  try {
    localStorage.setItem(ASPIRATIONS_KEY, JSON.stringify([...aspirations]));
  } catch (e) { /* ignore */ }
}

// --- Quiz State Helpers ---

function isValueCompleted(vi) {
  for (let qi = 0; qi < 5; qi++) {
    if (!answers[`${vi}_${qi}`]) return false;
  }
  return true;
}

function getCompletedCount() {
  return VALUES_DATA.reduce((n, _, vi) => n + (isValueCompleted(vi) ? 1 : 0), 0);
}

function getCompletedValues() {
  const completed = [];
  VALUES_DATA.forEach((v, vi) => {
    if (isValueCompleted(vi)) {
      let sum = 0;
      for (let qi = 0; qi < 5; qi++) {
        sum += answers[`${vi}_${qi}`] || 0;
      }
      completed.push({ name: v.name, avg: sum / 5 });
    }
  });
  completed.sort((a, b) => b.avg - a.avg);
  return completed;
}

function getDetailedCompletedValues() {
  const completed = [];
  VALUES_DATA.forEach((v, vi) => {
    if (isValueCompleted(vi)) {
      let sum = 0;
      const questionScores = [];
      for (let qi = 0; qi < 5; qi++) {
        const score = answers[`${vi}_${qi}`] || 0;
        sum += score;
        questionScores.push({
          area: v.questions[qi].area,
          question: v.questions[qi].text,
          score
        });
      }
      completed.push({
        name: v.name,
        average: parseFloat((sum / 5).toFixed(2)),
        questions: questionScores
      });
    }
  });
  completed.sort((a, b) => b.average - a.average);
  return completed;
}

function buildExportData(completedValues) {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    quizLevel: quizLevel || 'full-spectrum',
    totalValues: getActiveTotal(),
    completedCount: completedValues.length,
    values: completedValues.map((v, i) => ({
      rank: i + 1,
      name: v.name,
      average: v.average,
      questions: v.questions
    }))
  };
}
