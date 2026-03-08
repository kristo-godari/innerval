let currentIndex = 0;
const answers = {};
const skippedSet = new Set();

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
  document.getElementById('landing').style.display = 'none';
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
  document.getElementById('quiz').style.display = 'none';
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
    html += `
      <div class="result-row">
        <div class="rank ${rankClass}">#${i + 1}</div>
        <div class="result-info">
          <div class="result-name">${s.name}</div>
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
  document.getElementById('results').style.display = 'none';
  document.getElementById('quiz').style.display = 'none';
  document.getElementById('landing').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- Auto-restore on page load ----
(function initFromStorage() {
  const saved = loadProgress();
  if (!saved) return;
  // Show restart on landing page since progress exists
  document.getElementById('landingRestart').style.display = '';
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
