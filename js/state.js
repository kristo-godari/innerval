// Global application state and localStorage persistence.

const STORAGE_KEY = 'values_quiz_progress';
const ASPIRATIONS_KEY = 'innerval_aspirations';

let currentIndex = 0;
const answers = {};
const skippedSet = new Set();
let aspirations = new Set();

// --- Quiz Progress Storage ---

function saveProgress(screen) {
  const data = {
    answers: { ...answers },
    currentIndex,
    skipped: [...skippedSet],
    screen: screen || 'quiz'
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
    totalValues: VALUES_DATA.length,
    completedCount: completedValues.length,
    values: completedValues.map((v, i) => ({
      rank: i + 1,
      name: v.name,
      average: v.average,
      questions: v.questions
    }))
  };
}
