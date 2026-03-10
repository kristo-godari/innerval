// Quiz screen: rendering values, answering, skipping, summary panel.

function startQuiz() {
  const saved = loadProgress();
  const hasResults = saved && saved.screen === 'results' && Object.keys(saved.answers).length > 0;
  const hasProgress = saved && saved.screen === 'quiz' && Object.keys(saved.answers).length > 0;

  hideAllScreens();
  document.getElementById('quiz').style.display = 'block';

  if (hasResults) {
    Object.entries(saved.answers).forEach(function(entry) { answers[entry[0]] = entry[1]; });
    currentIndex = saved.currentIndex || 0;
    (saved.skipped || []).forEach(function(i) { skippedSet.add(i); });
    showPreviousResultsBanner(true);
    renderValue();
    return;
  }

  showPreviousResultsBanner(false);

  if (hasProgress) {
    renderValue();
    return;
  }

  currentIndex = 0;
  saveProgress();
  renderValue();
}

function showPreviousResultsBanner(show) {
  document.getElementById('previousResultsBanner').style.display = show ? 'flex' : 'none';
  document.getElementById('quizContent').style.display = show ? 'none' : '';
}

function viewPreviousResults() {
  showPreviousResultsBanner(false);
  showResults();
}

function startNewTest() {
  showPreviousResultsBanner(false);
  clearProgress();
  currentIndex = 0;
  Object.keys(answers).forEach(k => delete answers[k]);
  skippedSet.clear();
  saveProgress();
  renderValue();
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
  document.getElementById('skipBtn').style.display = isValueCompleted(currentIndex) ? 'none' : '';

  const allDone = getCompletedCount() === total;
  const isLast = currentIndex === total - 1;
  document.getElementById('nextBtn').textContent = (allDone || isLast) ? 'See Results →' : 'Next →';

  updateSkippedBanner();
  updateSummaryPanel();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function saveAnswer(key, val) {
  answers[key] = val;
  if (isValueCompleted(currentIndex)) {
    skippedSet.delete(currentIndex);
    updateSkippedBanner();
    updateSummaryPanel();
    document.getElementById('skipBtn').style.display = 'none';
  }
  saveProgress();
}

function nextValue() {
  if (!isValueCompleted(currentIndex)) {
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

  if (getCompletedCount() === VALUES_DATA.length) {
    showResults();
    return;
  }
  if (currentIndex < VALUES_DATA.length - 1) {
    currentIndex++;
    renderValue();
  } else {
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

function skipValue() {
  skippedSet.add(currentIndex);
  saveProgress();
  if (currentIndex < VALUES_DATA.length - 1) {
    currentIndex++;
    renderValue();
  } else {
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
    const next = arr.find(i => i > currentIndex) ?? arr[0];
    currentIndex = next;
    renderValue();
  }
}

function jumpToValue(index) {
  currentIndex = index;
  renderValue();
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
  navigateToLanding();
}

// --- Skipped Banner ---

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

// --- Summary Panel ---

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
