let currentIndex = 0;
const answers = {};
const skippedSet = new Set();

// ---- Navigation helpers ----
function isInQuizOrResults() {
  return document.getElementById('landing').style.display === 'none' &&
    document.getElementById('compareUpload').style.display !== 'block' &&
    document.getElementById('compareResults').style.display !== 'block';
}

function isInAnyActiveScreen() {
  return document.getElementById('landing').style.display === 'none';
}

function updateLandingButtons() {
  const hasProgress = loadProgress();
  const restartWrap = document.getElementById('landingRestart');
  const heroBtn = document.querySelector('.btn-hero span');
  if (hasProgress && Object.keys(hasProgress.answers).length > 0) {
    restartWrap.style.display = '';
    heroBtn.textContent = 'Continue Test';
  } else {
    restartWrap.style.display = 'none';
    heroBtn.textContent = 'Begin Your Journey';
  }
}

function showLeaveModal(navigateFn) {
  showModal({
    icon: '🚪',
    title: 'Leave the Quiz?',
    message: 'Your progress is saved automatically. You can come back and continue later.',
    buttons: [
      { label: 'Stay', cls: 'btn-primary' },
      { label: 'Save & Leave', cls: 'btn-secondary', action: navigateFn },
      { label: 'Restart', cls: 'btn-end', action: function() { doRestart(); navigateFn(); } }
    ]
  });
}

function goHome() {
  if (isInQuizOrResults()) {
    showLeaveModal(function() {
      hideAllScreens();
      document.getElementById('landing').style.display = 'block';
      updateLandingButtons();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    return;
  }
  // If in compare screens, just go home directly
  if (isInAnyActiveScreen()) {
    hideAllScreens();
    document.getElementById('landing').style.display = 'block';
    updateLandingButtons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goSection(id) {
  if (isInQuizOrResults()) {
    showLeaveModal(function() {
      hideAllScreens();
      document.getElementById('landing').style.display = 'block';
      updateLandingButtons();
      setTimeout(function() {
        var el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
    return;
  }
  // If in compare screens, just go directly
  if (isInAnyActiveScreen()) {
    hideAllScreens();
    document.getElementById('landing').style.display = 'block';
    updateLandingButtons();
    setTimeout(function() {
      var el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return;
  }
  var el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
  document.getElementById('navLinks').classList.remove('open');
}

function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

// Header shadow on scroll
window.addEventListener('scroll', function() {
  document.getElementById('siteHeader').classList.toggle('scrolled', window.scrollY > 10);
});

// Intercept external page links (e.g. privacy.html, terms.html) during quiz/results
document.addEventListener('click', function(e) {
  if (!isInQuizOrResults()) return;
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  // Only intercept links to other pages (not # anchors, javascript:, or blob:)
  if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('blob:')) return;
  e.preventDefault();
  showLeaveModal(function() { window.location.href = href; });
});

// ---- Custom Modal ----
function showModal({ icon, title, message, buttons }) {
  document.getElementById('modalIcon').textContent = icon || '';
  document.getElementById('modalTitle').textContent = title || '';
  document.getElementById('modalMessage').textContent = message || '';
  const actionsEl = document.getElementById('modalActions');
  actionsEl.innerHTML = '';
  buttons.forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'btn ' + (b.cls || 'btn-secondary');
    btn.textContent = b.label;
    btn.onclick = () => { closeModal(); if (b.action) b.action(); };
    actionsEl.appendChild(btn);
  });
  document.getElementById('modalOverlay').classList.add('visible');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('visible');
}

function startQuiz() {
  hideAllScreens();
  document.getElementById('quiz').style.display = 'block';
  currentIndex = 0;
  saveProgress();
  renderValue();
}

function isValueCompleted(vi) {
  for (let qi = 0; qi < 5; qi++) {
    if (!answers[`${vi}_${qi}`]) return false;
  }
  return true;
}

function getCompletedCount() {
  return VALUES_DATA.reduce((n, _, vi) => n + (isValueCompleted(vi) ? 1 : 0), 0);
}

function updateSkippedBanner() {
  const count = skippedSet.size;
  const banner = document.getElementById('skippedBanner');
  if (count > 0) {
    banner.style.display = 'flex';
    document.getElementById('skippedCount').textContent = count;
  } else {
    banner.style.display = 'none';
  }
}

function renderValue() {
  const v = VALUES_DATA[currentIndex];
  const total = VALUES_DATA.length;
  const completed = getCompletedCount();
  const pct = Math.round((completed / total) * 100);

  document.getElementById('progressLabel').textContent = `Completed ${completed} of ${total}`;
  document.getElementById('progressPct').textContent = `${pct}%`;
  document.getElementById('progressFill').style.width = `${pct}%`;

  const desc = VALUE_DESCRIPTIONS[v.name] || '';
  let html = `<div class="value-name">${v.name}</div>`;
  if (desc) html += `<div class="value-desc">${desc}</div>`;
  html += `<div class="value-number">Value ${currentIndex + 1} of ${total} — Rate each scenario from 1 (Not at all) to 5 (Absolutely)</div>`;

  v.questions.forEach((q, qi) => {
    const key = `${currentIndex}_${qi}`;
    const saved = answers[key] || 0;
    html += `<div class="question">`;
    html += `<div class="q-area">${q.area}</div>`;
    html += `<div class="q-label">${q.text}</div>`;
    html += `<div class="likert">`;
    for (let s = 1; s <= 5; s++) {
      html += `<label><input type="radio" name="q${key}" value="${s}" ${saved === s ? 'checked' : ''} onchange="saveAnswer('${key}',${s})"><span class="chip">${s}</span></label>`;
    }
    html += `</div>`;
    html += `<div class="likert-labels"><span>Not at all</span><span>Absolutely</span></div>`;
    html += `</div>`;
  });

  document.getElementById('valueCard').innerHTML = html;
  document.getElementById('prevBtn').disabled = currentIndex === 0;

  // Update skip button visibility — hide if already completed
  document.getElementById('skipBtn').style.display = isValueCompleted(currentIndex) ? 'none' : '';

  // Update next button text
  const allDone = getCompletedCount() === total;
  const isLast = currentIndex === total - 1;
  if (allDone || isLast) {
    document.getElementById('nextBtn').textContent = 'See Results →';
  } else {
    document.getElementById('nextBtn').textContent = 'Next →';
  }

  updateSkippedBanner();
  updateSummaryPanel();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function saveAnswer(key, val) {
  answers[key] = val;
  // If all questions for current value are now answered, remove from skipped
  if (isValueCompleted(currentIndex)) {
    skippedSet.delete(currentIndex);
    updateSkippedBanner();
    updateSummaryPanel();
    // Update skip button
    document.getElementById('skipBtn').style.display = 'none';
  }
  saveProgress();
}

function allAnsweredForCurrent() {
  return isValueCompleted(currentIndex);
}

function skipValue() {
  skippedSet.add(currentIndex);
  saveProgress();
  if (currentIndex < VALUES_DATA.length - 1) {
    currentIndex++;
    renderValue();
  } else {
    // Wrap around to find the next unanswered
    const next = findNextUnanswered(0);
    if (next !== -1) {
      currentIndex = next;
      renderValue();
    } else {
      renderValue();
    }
  }
}

function findNextUnanswered(startFrom) {
  for (let i = startFrom; i < VALUES_DATA.length; i++) {
    if (!isValueCompleted(i)) return i;
  }
  return -1;
}

function goToNextSkipped() {
  const arr = [...skippedSet].sort((a, b) => a - b);
  if (arr.length > 0) {
    // Find the first skipped after current, or wrap around
    const next = arr.find(i => i > currentIndex) ?? arr[0];
    currentIndex = next;
    renderValue();
  }
}

function nextValue() {
  if (!allAnsweredForCurrent()) {
    showModal({
      icon: '✏️',
      title: 'Incomplete Answers',
      message: 'Please answer all 5 questions before continuing, or use Skip to come back later.',
      buttons: [{ label: 'Got it', cls: 'btn-primary' }]
    });
    return;
  }
  skippedSet.delete(currentIndex);
  saveProgress();

  // Check if all values done
  if (getCompletedCount() === VALUES_DATA.length) {
    showResults();
    return;
  }

  if (currentIndex < VALUES_DATA.length - 1) {
    currentIndex++;
    renderValue();
  } else {
    // At end, check for skipped
    const next = findNextUnanswered(0);
    if (next !== -1) {
      currentIndex = next;
      renderValue();
    } else {
      showResults();
    }
  }
}

function prevValue() {
  if (currentIndex > 0) {
    currentIndex--;
    saveProgress();
    renderValue();
  }
}

function jumpToValue(index) {
  currentIndex = index;
  renderValue();
  // Close summary panel on mobile for better UX
  if (window.innerWidth < 600) {
    document.getElementById('summaryPanel').classList.remove('open');
  }
}

function endTest() {
  const completed = getCompletedCount();
  if (completed === 0) {
    showModal({
      icon: '⚠️',
      title: 'No Values Completed',
      message: 'Please complete at least one value before ending the test.',
      buttons: [{ label: 'Got it', cls: 'btn-primary' }]
    });
    return;
  }
  showModal({
    icon: '🏁',
    title: 'End Test?',
    message: `You have completed ${completed} of ${VALUES_DATA.length} values. End now and see results?`,
    buttons: [
      { label: 'Cancel', cls: 'btn-secondary' },
      { label: 'See Results', cls: 'btn-primary', action: showResults }
    ]
  });
}

function toggleSummary() {
  document.getElementById('summaryPanel').classList.toggle('open');
  updateSummaryPanel();
}

function updateSummaryPanel() {
  const total = VALUES_DATA.length;
  const completed = getCompletedCount();
  const skipped = skippedSet.size;
  const pending = total - completed - skipped;

  document.getElementById('summaryStats').innerHTML =
    `<span class="stat"><span class="stat-dot completed"></span> ${completed} completed</span>` +
    `<span class="stat"><span class="stat-dot skipped"></span> ${skipped} skipped</span>` +
    `<span class="stat"><span class="stat-dot pending"></span> ${pending} remaining</span>`;

  let html = '';
  VALUES_DATA.forEach((v, i) => {
    const done = isValueCompleted(i);
    const skip = skippedSet.has(i);
    const active = i === currentIndex ? ' active' : '';
    let icon, scoreText = '';
    if (done) {
      icon = '✅';
      let sum = 0;
      for (let qi = 0; qi < 5; qi++) sum += answers[`${i}_${qi}`] || 0;
      scoreText = (sum / 5).toFixed(1);
    } else if (skip) {
      icon = '⏭';
    } else {
      icon = '○';
    }
    html += `<div class="summary-item${active}" onclick="jumpToValue(${i})">
      <span class="status-icon">${icon}</span>
      <span class="item-name">${v.name}</span>
      ${scoreText ? `<span class="item-score">${scoreText}</span>` : ''}
    </div>`;
  });
  document.getElementById('summaryGrid').innerHTML = html;
}

function showResults() {
  hideAllScreens();
  document.getElementById('results').style.display = 'block';
  saveProgress('results');

  const completedValues = [];
  VALUES_DATA.forEach((v, vi) => {
    if (isValueCompleted(vi)) {
      let sum = 0;
      for (let qi = 0; qi < 5; qi++) {
        sum += answers[`${vi}_${qi}`] || 0;
      }
      completedValues.push({ name: v.name, avg: sum / 5 });
    }
  });

  completedValues.sort((a, b) => b.avg - a.avg);

  const totalValues = VALUES_DATA.length;
  const notice = document.getElementById('partialNotice');
  if (completedValues.length < totalValues) {
    notice.style.display = 'block';
    notice.textContent = `Showing results for ${completedValues.length} of ${totalValues} values. ${totalValues - completedValues.length} values were skipped.`;
  } else {
    notice.style.display = 'none';
  }

  const count = completedValues.length;
  const tiers = [
    { label: '🏆 Core Values (Top Tier)', pct: 0.16 },
    { label: '⭐ Very Important', pct: 0.32 },
    { label: '✅ Important', pct: 0.56 },
    { label: '➖ Moderate', pct: 0.80 },
    { label: '📉 Less Important', pct: 1.0 }
  ];

  // Compute tier boundaries based on completed count
  const tierBounds = tiers.map(t => Math.round(t.pct * count));

  let html = '';
  let tierIdx = 0;
  let tierStart = 0;

  completedValues.forEach((s, i) => {
    while (tierIdx < tierBounds.length && i >= tierBounds[tierIdx]) {
      tierIdx++;
    }
    if (i === tierStart && tierIdx < tiers.length) {
      html += `<div class="tier-label">${tiers[tierIdx].label}</div>`;
      tierStart = tierBounds[tierIdx] || count;
    }

    const pct = (s.avg / 5) * 100;
    let rankClass = '';
    if (i === 0) rankClass = 'gold';
    else if (i === 1) rankClass = 'silver';
    else if (i === 2) rankClass = 'bronze';

    const hue = Math.round((pct / 100) * 120);
    const desc = VALUE_DESCRIPTIONS[s.name] || '';
    html += `
      <div class="result-row">
        <div class="rank ${rankClass}">#${i + 1}</div>
        <div class="result-info">
          <div class="result-name">${s.name}</div>
          ${desc ? `<div class="result-desc">${desc}</div>` : ''}
          <div class="result-bar-wrap">
            <div class="result-bar" style="width:${pct}%;background:hsl(${hue},70%,50%)"></div>
          </div>
        </div>
        <div class="result-score">${s.avg.toFixed(1)}</div>
      </div>`;
  });

  document.getElementById('resultsList').innerHTML = html;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- LocalStorage Persistence ----
const STORAGE_KEY = 'values_quiz_progress';

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

function restartTest() {
  showModal({
    icon: '🔄',
    title: 'Restart Test?',
    message: 'This will erase all your progress. Are you sure?',
    buttons: [
      { label: 'Cancel', cls: 'btn-secondary' },
      { label: 'Restart', cls: 'btn-end', action: doRestart }
    ]
  });
}

function doRestart() {
  clearProgress();
  currentIndex = 0;
  Object.keys(answers).forEach(k => delete answers[k]);
  skippedSet.clear();
  hideAllScreens();
  document.getElementById('landing').style.display = 'block';
  updateLandingButtons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- Auto-restore on page load ----
(function initFromStorage() {
  const saved = loadProgress();
  if (!saved) return;
  // Show restart on landing page since progress exists
  updateLandingButtons();
  // Restore answers
  Object.entries(saved.answers).forEach(([k, v]) => { answers[k] = v; });
  currentIndex = saved.currentIndex || 0;
  (saved.skipped || []).forEach(i => skippedSet.add(i));

  if (saved.screen === 'results') {
    document.getElementById('landing').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    showResults();
  } else if (saved.screen === 'quiz') {
    document.getElementById('landing').style.display = 'none';
    document.getElementById('quiz').style.display = 'block';
    renderValue();
  }
})();

function downloadPDF() {
  const element = document.getElementById('results');
  const opt = {
    margin:       [10, 10, 10, 10],
    filename:     'innerval-values-report.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
  };
  html2pdf().set(opt).from(element).save();
}

function exportResultsJSON() {
  const completedValues = [];
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
          score: score
        });
      }
      completedValues.push({
        name: v.name,
        average: parseFloat((sum / 5).toFixed(2)),
        questions: questionScores
      });
    }
  });

  completedValues.sort((a, b) => b.average - a.average);

  const result = {
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

  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toISOString().slice(0, 10);
  a.download = 'innerval-results-' + date + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function handleContactSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();
  if (!name || !email || !message) return;
  // mailto fallback – opens the user's email client with prefilled fields
  const subject = encodeURIComponent('Feedback from ' + name);
  const body = encodeURIComponent('From: ' + name + ' (' + email + ')\n\n' + message);
  window.location.href = 'mailto:hello@innerval.app?subject=' + subject + '&body=' + body;
  form.reset();
  document.getElementById('formSuccess').style.display = 'block';
}

// ================================================================
// COMPARISON FEATURE
// ================================================================

let compareData1 = null;
let compareData2 = null;
let compareFromResultsMode = false;

function hideAllScreens() {
  ['landing', 'quiz', 'results', 'compareUpload', 'compareResults'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });
}

function showCompareUpload() {
  if (isInQuizOrResults()) {
    showLeaveModal(function() {
      hideAllScreens();
      document.getElementById('compareUpload').style.display = 'block';
      compareFromResultsMode = false;
      resetCompareUpload();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    return;
  }
  hideAllScreens();
  document.getElementById('compareUpload').style.display = 'block';
  compareFromResultsMode = false;
  resetCompareUpload();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function compareFromResults() {
  // Build current user's data from answers
  const currentUserData = buildCurrentUserExport();
  if (!currentUserData) {
    showModal({
      icon: '⚠️',
      title: 'No Results',
      message: 'Please complete at least one value before comparing.',
      buttons: [{ label: 'Got it', cls: 'btn-primary' }]
    });
    return;
  }
  hideAllScreens();
  document.getElementById('compareUpload').style.display = 'block';
  compareFromResultsMode = true;
  resetCompareUpload();
  // Pre-fill Person A with current results
  compareData1 = currentUserData;
  const dz1 = document.getElementById('dropzone1');
  dz1.classList.add('loaded');
  document.getElementById('dropFile1').style.display = 'block';
  document.getElementById('dropFile1').textContent = '✓ Your current results (' + currentUserData.completedCount + ' values)';
  dz1.querySelector('.dropzone-hint').style.display = 'none';
  dz1.querySelector('.btn').style.display = 'none';
  updateCompareBtn();
}

function buildCurrentUserExport() {
  const completedValues = [];
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
          score: score
        });
      }
      completedValues.push({
        name: v.name,
        average: parseFloat((sum / 5).toFixed(2)),
        questions: questionScores
      });
    }
  });
  if (completedValues.length === 0) return null;
  completedValues.sort((a, b) => b.average - a.average);
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

function resetCompareUpload() {
  compareData1 = null;
  compareData2 = null;
  [1, 2].forEach(n => {
    const dz = document.getElementById('dropzone' + n);
    dz.classList.remove('loaded', 'dragover');
    document.getElementById('dropFile' + n).style.display = 'none';
    document.getElementById('dropFile' + n).textContent = '';
    dz.querySelector('.dropzone-hint').style.display = '';
    dz.querySelector('.btn').style.display = '';
    document.getElementById('fileInput' + n).value = '';
  });
  updateCompareBtn();
}

function cancelCompare() {
  hideAllScreens();
  if (compareFromResultsMode) {
    document.getElementById('results').style.display = 'block';
  } else {
    document.getElementById('landing').style.display = 'block';
    updateLandingButtons();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToCompareUpload() {
  hideAllScreens();
  document.getElementById('compareUpload').style.display = 'block';
  resetCompareUpload();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('dragover');
}

function handleDrop(e, num) {
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) processFile(file, num);
}

function handleFileSelect(e, num) {
  const file = e.target.files[0];
  if (file) processFile(file, num);
}

function processFile(file, num) {
  if (!file.name.endsWith('.json')) {
    showModal({
      icon: '⚠️',
      title: 'Invalid File',
      message: 'Please upload a .json file exported from Innerval.',
      buttons: [{ label: 'Got it', cls: 'btn-primary' }]
    });
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!validateExport(data)) {
        showModal({
          icon: '⚠️',
          title: 'Invalid Format',
          message: 'This file doesn\'t appear to be a valid Innerval export. Make sure to use the "Export Data" button to generate it.',
          buttons: [{ label: 'Got it', cls: 'btn-primary' }]
        });
        return;
      }
      if (num === 1) compareData1 = data;
      else compareData2 = data;

      const dz = document.getElementById('dropzone' + num);
      dz.classList.add('loaded');
      const fileEl = document.getElementById('dropFile' + num);
      fileEl.style.display = 'block';
      fileEl.textContent = '✓ ' + file.name + ' (' + data.completedCount + ' values)';
      dz.querySelector('.dropzone-hint').style.display = 'none';
      dz.querySelector('.btn').style.display = 'none';
      updateCompareBtn();
    } catch (err) {
      showModal({
        icon: '❌',
        title: 'Parse Error',
        message: 'Could not read this file. Please make sure it\'s a valid JSON export.',
        buttons: [{ label: 'Got it', cls: 'btn-primary' }]
      });
    }
  };
  reader.readAsText(file);
}

function validateExport(data) {
  return data && typeof data === 'object' && Array.isArray(data.values) &&
    data.values.length > 0 && data.values[0].name && typeof data.values[0].average === 'number';
}

function updateCompareBtn() {
  document.getElementById('compareBtn').disabled = !(compareData1 && compareData2);
}

// ---- Main Comparison Logic ----

function runComparison() {
  if (!compareData1 || !compareData2) return;
  hideAllScreens();
  document.getElementById('compareResults').style.display = 'block';
  renderComparison(compareData1, compareData2);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderComparison(dataA, dataB) {
  const nameA = 'Person A';
  const nameB = 'Person B';
  document.getElementById('compareSubtitle').textContent = nameA + ' vs ' + nameB;
  document.getElementById('legendA').textContent = nameA;
  document.getElementById('legendB').textContent = nameB;
  document.getElementById('tierColA').textContent = nameA;
  document.getElementById('tierColB').textContent = nameB;

  // Build lookup maps
  const mapA = {};
  dataA.values.forEach(v => { mapA[v.name] = v; });
  const mapB = {};
  dataB.values.forEach(v => { mapB[v.name] = v; });

  // Find common values
  const commonNames = dataA.values.filter(v => mapB[v.name]).map(v => v.name);
  const onlyA = dataA.values.filter(v => !mapB[v.name]).map(v => v.name);
  const onlyB = dataB.values.filter(v => !mapA[v.name]).map(v => v.name);

  // Calculate alignment (Spearman rank correlation on common values)
  const alignment = calculateAlignment(dataA.values, dataB.values, commonNames);

  // Render alignment ring
  renderAlignmentRing(alignment);

  // Summary stats
  renderSummaryStats(commonNames, onlyA, onlyB, dataA, dataB, alignment);

  // Radar chart (top 10 union)
  renderRadarChart(dataA.values, dataB.values, mapA, mapB);

  // Side by side top 5
  renderSideBySide(dataA.values, dataB.values, nameA, nameB);

  // Similarities & differences
  const diffs = commonNames.map(name => ({
    name,
    avgA: mapA[name].average,
    avgB: mapB[name].average,
    diff: Math.abs(mapA[name].average - mapB[name].average)
  }));
  diffs.sort((a, b) => a.diff - b.diff);

  renderSimilarities(diffs.slice(0, 8), nameA, nameB);
  renderDifferences([...diffs].sort((a, b) => b.diff - a.diff).slice(0, 8), nameA, nameB);

  // Tier table
  renderTierTable(dataA.values, dataB.values, mapA, mapB, commonNames);

  // Category breakdown
  renderCategoryBreakdown(dataA.values, dataB.values, nameA, nameB);
}

function calculateAlignment(valsA, valsB, commonNames) {
  if (commonNames.length < 2) return 0;
  const rankA = {};
  const rankB = {};
  valsA.forEach(v => { rankA[v.name] = v.rank; });
  valsB.forEach(v => { rankB[v.name] = v.rank; });
  const n = commonNames.length;
  let dSquaredSum = 0;
  commonNames.forEach(name => {
    const d = (rankA[name] || 0) - (rankB[name] || 0);
    dSquaredSum += d * d;
  });
  // Spearman: 1 - 6*sum(d^2) / (n*(n^2-1))
  const rho = 1 - (6 * dSquaredSum) / (n * (n * n - 1));
  // Convert to 0-100 percentage
  return Math.max(0, Math.round(((rho + 1) / 2) * 100));
}

function renderAlignmentRing(pct) {
  const arc = document.getElementById('alignmentArc');
  const circumference = 2 * Math.PI * 54; // 339.29
  const offset = circumference - (pct / 100) * circumference;
  // Animate
  setTimeout(() => {
    arc.style.transition = 'stroke-dashoffset 1.5s ease';
    arc.style.strokeDashoffset = offset;
  }, 100);
  document.getElementById('alignmentValue').textContent = pct + '%';

  let desc = '';
  if (pct >= 80) desc = 'Very high alignment — you share remarkably similar value priorities!';
  else if (pct >= 60) desc = 'Strong alignment — many of your core values overlap.';
  else if (pct >= 40) desc = 'Moderate alignment — you share some priorities but differ in others.';
  else if (pct >= 20) desc = 'Low alignment — your value priorities are quite different.';
  else desc = 'Very different priorities — you approach life from contrasting value frameworks.';
  document.getElementById('alignmentDesc').textContent = desc;
}

function renderSummaryStats(common, onlyA, onlyB, dataA, dataB, alignment) {
  const html = `
    <div class="cstat-card">
      <div class="cstat-num">${common.length}</div>
      <div class="cstat-label">Shared Values</div>
    </div>
    <div class="cstat-card">
      <div class="cstat-num">${dataA.completedCount}</div>
      <div class="cstat-label">Person A Values</div>
    </div>
    <div class="cstat-card">
      <div class="cstat-num">${dataB.completedCount}</div>
      <div class="cstat-label">Person B Values</div>
    </div>
    <div class="cstat-card">
      <div class="cstat-num">${alignment}%</div>
      <div class="cstat-label">Rank Alignment</div>
    </div>
  `;
  document.getElementById('compareStats').innerHTML = html;
}

function renderRadarChart(valsA, valsB, mapA, mapB) {
  // Get the union of top 10 from each
  const topANames = valsA.slice(0, 10).map(v => v.name);
  const topBNames = valsB.slice(0, 10).map(v => v.name);
  const unionSet = new Set([...topANames, ...topBNames]);
  const labels = [...unionSet].slice(0, 12); // Cap at 12 for readability
  const n = labels.length;
  if (n < 3) return;

  const cx = 250, cy = 250, maxR = 180;
  const angleStep = (2 * Math.PI) / n;

  let svg = '';

  // Grid rings
  for (let ring = 1; ring <= 5; ring++) {
    const r = (ring / 5) * maxR;
    let points = '';
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      points += `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)} `;
    }
    svg += `<polygon points="${points}" fill="none" stroke="var(--border)" stroke-width="1" opacity="${ring === 5 ? 0.6 : 0.3}"/>`;
  }

  // Axis lines + labels
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const x2 = cx + maxR * Math.cos(angle);
    const y2 = cy + maxR * Math.sin(angle);
    svg += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="var(--border)" stroke-width="0.5"/>`;
    const lx = cx + (maxR + 24) * Math.cos(angle);
    const ly = cy + (maxR + 24) * Math.sin(angle);
    const anchor = Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : (Math.cos(angle) > 0 ? 'start' : 'end');
    svg += `<text x="${lx}" y="${ly}" text-anchor="${anchor}" dominant-baseline="central" font-size="11" fill="var(--muted)" font-weight="600">${labels[i]}</text>`;
  }

  // Data polygons
  function makePolygon(vals, map, color, opacityFill) {
    let points = '';
    for (let i = 0; i < n; i++) {
      const val = map[labels[i]] ? map[labels[i]].average : 0;
      const r = (val / 5) * maxR;
      const angle = i * angleStep - Math.PI / 2;
      points += `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)} `;
    }
    return `<polygon points="${points}" fill="${color}" fill-opacity="${opacityFill}" stroke="${color}" stroke-width="2.5"/>`;
  }

  svg += makePolygon(valsA, mapA, '#4f46e5', 0.15);
  svg += makePolygon(valsB, mapB, '#e11d48', 0.15);

  // Data points
  function makePoints(map, color) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const val = map[labels[i]] ? map[labels[i]].average : 0;
      const r = (val / 5) * maxR;
      const angle = i * angleStep - Math.PI / 2;
      s += `<circle cx="${cx + r * Math.cos(angle)}" cy="${cy + r * Math.sin(angle)}" r="4" fill="${color}" stroke="white" stroke-width="1.5"/>`;
    }
    return s;
  }

  svg += makePoints(mapA, '#4f46e5');
  svg += makePoints(mapB, '#e11d48');

  document.getElementById('radarChart').innerHTML = svg;
}

function renderSideBySide(valsA, valsB, nameA, nameB) {
  const topA = valsA.slice(0, 5);
  const topB = valsB.slice(0, 5);

  let html = `
    <div class="sbs-col">
      <div class="sbs-header sbs-a">${nameA}</div>
      ${topA.map((v, i) => `
        <div class="sbs-item">
          <span class="sbs-rank">#${i + 1}</span>
          <span class="sbs-name">${v.name}</span>
          <span class="sbs-score">${v.average.toFixed(1)}</span>
        </div>
      `).join('')}
    </div>
    <div class="sbs-col">
      <div class="sbs-header sbs-b">${nameB}</div>
      ${topB.map((v, i) => `
        <div class="sbs-item">
          <span class="sbs-rank">#${i + 1}</span>
          <span class="sbs-name">${v.name}</span>
          <span class="sbs-score">${v.average.toFixed(1)}</span>
        </div>
      `).join('')}
    </div>
  `;
  document.getElementById('sideBySide').innerHTML = html;
}

function renderSimilarities(items, nameA, nameB) {
  if (items.length === 0) {
    document.getElementById('similarities').innerHTML = '<p class="no-data">No shared values to compare.</p>';
    return;
  }
  let html = '';
  items.forEach(item => {
    const maxVal = Math.max(item.avgA, item.avgB);
    const pctA = (item.avgA / 5) * 100;
    const pctB = (item.avgB / 5) * 100;
    html += `
      <div class="diff-row">
        <div class="diff-name">${item.name}</div>
        <div class="diff-bars">
          <div class="diff-bar-row">
            <span class="diff-label">${nameA}</span>
            <div class="diff-bar-track"><div class="diff-bar bar-a" style="width:${pctA}%"></div></div>
            <span class="diff-val">${item.avgA.toFixed(1)}</span>
          </div>
          <div class="diff-bar-row">
            <span class="diff-label">${nameB}</span>
            <div class="diff-bar-track"><div class="diff-bar bar-b" style="width:${pctB}%"></div></div>
            <span class="diff-val">${item.avgB.toFixed(1)}</span>
          </div>
        </div>
        <div class="diff-badge similar">Δ ${item.diff.toFixed(1)}</div>
      </div>
    `;
  });
  document.getElementById('similarities').innerHTML = html;
}

function renderDifferences(items, nameA, nameB) {
  if (items.length === 0) {
    document.getElementById('differences').innerHTML = '<p class="no-data">No shared values to compare.</p>';
    return;
  }
  let html = '';
  items.forEach(item => {
    const pctA = (item.avgA / 5) * 100;
    const pctB = (item.avgB / 5) * 100;
    html += `
      <div class="diff-row">
        <div class="diff-name">${item.name}</div>
        <div class="diff-bars">
          <div class="diff-bar-row">
            <span class="diff-label">${nameA}</span>
            <div class="diff-bar-track"><div class="diff-bar bar-a" style="width:${pctA}%"></div></div>
            <span class="diff-val">${item.avgA.toFixed(1)}</span>
          </div>
          <div class="diff-bar-row">
            <span class="diff-label">${nameB}</span>
            <div class="diff-bar-track"><div class="diff-bar bar-b" style="width:${pctB}%"></div></div>
            <span class="diff-val">${item.avgB.toFixed(1)}</span>
          </div>
        </div>
        <div class="diff-badge different">Δ ${item.diff.toFixed(1)}</div>
      </div>
    `;
  });
  document.getElementById('differences').innerHTML = html;
}

function getTier(rank, total) {
  const pct = rank / total;
  if (pct <= 0.16) return '🏆 Core';
  if (pct <= 0.32) return '⭐ Very Important';
  if (pct <= 0.56) return '✅ Important';
  if (pct <= 0.80) return '➖ Moderate';
  return '📉 Less Important';
}

function getTierClass(rank, total) {
  const pct = rank / total;
  if (pct <= 0.16) return 'tier-core';
  if (pct <= 0.32) return 'tier-very';
  if (pct <= 0.56) return 'tier-important';
  if (pct <= 0.80) return 'tier-moderate';
  return 'tier-less';
}

function renderTierTable(valsA, valsB, mapA, mapB, commonNames) {
  const totalA = valsA.length;
  const totalB = valsB.length;
  // Sort by average difference for interest
  const rows = commonNames.map(name => {
    const a = mapA[name];
    const b = mapB[name];
    return {
      name,
      rankA: a.rank,
      rankB: b.rank,
      avgA: a.average,
      avgB: b.average,
      tierA: getTier(a.rank, totalA),
      tierB: getTier(b.rank, totalB),
      tierClassA: getTierClass(a.rank, totalA),
      tierClassB: getTierClass(b.rank, totalB),
      diff: Math.abs(a.average - b.average)
    };
  });
  rows.sort((a, b) => b.diff - a.diff);

  let html = '';
  rows.forEach(r => {
    const diffClass = r.diff < 0.5 ? 'diff-low' : r.diff < 1.5 ? 'diff-mid' : 'diff-high';
    html += `
      <tr>
        <td class="tier-name">${r.name}</td>
        <td><span class="tier-badge ${r.tierClassA}">${r.tierA}</span><br><span class="tier-score">${r.avgA.toFixed(1)} (#${r.rankA})</span></td>
        <td><span class="tier-badge ${r.tierClassB}">${r.tierB}</span><br><span class="tier-score">${r.avgB.toFixed(1)} (#${r.rankB})</span></td>
        <td><span class="diff-indicator ${diffClass}">${r.diff.toFixed(1)}</span></td>
      </tr>
    `;
  });
  document.getElementById('tierTableBody').innerHTML = html;
}

function renderCategoryBreakdown(valsA, valsB, nameA, nameB) {
  const areas = ['Work', 'Relationships', 'Personal', 'Social', 'Leisure'];

  // Compute average per area for each person
  function areaAverages(vals) {
    const areaMap = {};
    areas.forEach(a => { areaMap[a] = { sum: 0, count: 0 }; });
    vals.forEach(v => {
      if (v.questions) {
        v.questions.forEach(q => {
          if (areaMap[q.area]) {
            areaMap[q.area].sum += q.score;
            areaMap[q.area].count++;
          }
        });
      }
    });
    const result = {};
    areas.forEach(a => {
      result[a] = areaMap[a].count > 0 ? areaMap[a].sum / areaMap[a].count : 0;
    });
    return result;
  }

  const avgA = areaAverages(valsA);
  const avgB = areaAverages(valsB);

  let html = '<div class="cat-grid">';
  areas.forEach(area => {
    const pctA = (avgA[area] / 5) * 100;
    const pctB = (avgB[area] / 5) * 100;
    const icons = { Work: '💼', Relationships: '❤️', Personal: '🌱', Social: '🤝', Leisure: '🎯' };
    html += `
      <div class="cat-card">
        <div class="cat-icon">${icons[area] || '📊'}</div>
        <div class="cat-name">${area}</div>
        <div class="cat-bars">
          <div class="cat-bar-row">
            <span class="cat-label">${nameA}</span>
            <div class="cat-bar-track"><div class="cat-bar bar-a" style="width:${pctA}%"></div></div>
            <span class="cat-val">${avgA[area].toFixed(1)}</span>
          </div>
          <div class="cat-bar-row">
            <span class="cat-label">${nameB}</span>
            <div class="cat-bar-track"><div class="cat-bar bar-b" style="width:${pctB}%"></div></div>
            <span class="cat-val">${avgB[area].toFixed(1)}</span>
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  document.getElementById('categoryBreakdown').innerHTML = html;
}

function downloadComparisonPDF() {
  const element = document.getElementById('compareResults');
  const opt = {
    margin:       [10, 10, 10, 10],
    filename:     'innerval-comparison.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
  };
  html2pdf().set(opt).from(element).save();
}
