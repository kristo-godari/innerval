// Quiz screen: rendering values, answering, skipping, summary panel.

function startQuiz() {
  const saved = loadProgress();
  const hasResults = saved && saved.screen === 'results' && Object.keys(saved.answers).length > 0;
  const hasProgress = saved && saved.screen === 'quiz' && Object.keys(saved.answers).length > 0;

  if (hasResults) {
    quizLevel = saved.quizLevel || 'full-spectrum';
    hideAllScreens();
    document.getElementById('quiz').style.display = 'block';
    Object.entries(saved.answers).forEach(function(entry) { answers[entry[0]] = entry[1]; });
    currentIndex = saved.currentIndex || 0;
    (saved.skipped || []).forEach(function(i) { skippedSet.add(i); });
    showPreviousResultsBanner(true);
    renderValue();
    return;
  }

  if (hasProgress) {
    quizLevel = saved.quizLevel || 'full-spectrum';
    hideAllScreens();
    document.getElementById('quiz').style.display = 'block';
    showPreviousResultsBanner(false);
    renderValue();
    return;
  }

  // No saved progress — show level selection
  showLevelSelect();
}

function showLevelSelect() {
  hideAllScreens();
  document.getElementById('levelSelect').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function selectLevel(level) {
  quizLevel = level;
  var activeIndices = getActiveIndices();
  currentIndex = activeIndices[0];
  Object.keys(answers).forEach(function(k) { delete answers[k]; });
  skippedSet.clear();

  hideAllScreens();
  document.getElementById('quiz').style.display = 'block';
  showPreviousResultsBanner(false);
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
  quizLevel = null;
  Object.keys(answers).forEach(function(k) { delete answers[k]; });
  skippedSet.clear();
  showLevelSelect();
}

function renderValue() {
  var v = VALUES_DATA[currentIndex];
  var activeIndices = getActiveIndices();
  var total = activeIndices.length;
  var completed = getActiveCompletedCount();
  var pct = Math.round((completed / total) * 100);
  var position = activeIndices.indexOf(currentIndex) + 1;

  document.getElementById('progressLabel').textContent = 'Completed ' + completed + ' of ' + total;
  document.getElementById('progressPct').textContent = pct + '%';
  document.getElementById('progressFill').style.width = pct + '%';

  var desc = VALUE_DESCRIPTIONS[v.name] || '';
  var html = '<div class="value-name">' + v.name + '</div>';
  if (desc) html += '<div class="value-desc">' + desc + '</div>';
  html += '<div class="value-number">Value ' + position + ' of ' + total + ' \u2014 Rate each scenario based on how likely you would do it</div>';

  v.questions.forEach(function(q, qi) {
    var key = currentIndex + '_' + qi;
    var saved = answers[key] || 0;
    html += '<div class="question">';
    html += '<div class="q-area">' + q.area + '</div>';
    html += '<div class="q-label">' + q.text + '</div>';
    var chipLabels = ['No way', 'Unlikely', 'Maybe', 'Likely', 'Definitely'];
    html += '<div class="likert">';
    for (var s = 1; s <= 5; s++) {
      html += '<label><input type="radio" name="q' + key + '" value="' + s + '" ' + (saved === s ? 'checked' : '') + ' onchange="saveAnswer(\'' + key + '\',' + s + ')"><span class="chip">' + chipLabels[s - 1] + '</span></label>';
    }
    html += '</div>';
    html += '</div>';
  });

  document.getElementById('valueCard').innerHTML = html;
  document.getElementById('prevBtn').disabled = activeIndices.indexOf(currentIndex) === 0;
  document.getElementById('skipBtn').style.display = isValueCompleted(currentIndex) ? 'none' : '';

  var allDone = completed === total;
  var isLast = activeIndices.indexOf(currentIndex) === activeIndices.length - 1;
  document.getElementById('nextBtn').textContent = (allDone || isLast) ? 'See Results \u2192' : 'Next \u2192';

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
      icon: '\u270F\uFE0F',
      title: 'Incomplete Answers',
      message: 'Please answer all 5 questions before continuing, or use Skip to come back later.',
      buttons: [{ label: 'Got it', cls: 'btn-primary' }]
    });
    return;
  }
  skippedSet.delete(currentIndex);
  saveProgress();

  var activeIndices = getActiveIndices();
  var total = activeIndices.length;

  if (getActiveCompletedCount() === total) {
    showResults();
    return;
  }

  var currentPos = activeIndices.indexOf(currentIndex);
  if (currentPos < activeIndices.length - 1) {
    currentIndex = activeIndices[currentPos + 1];
    renderValue();
  } else {
    var next = findNextUnansweredActive(0);
    if (next !== -1) {
      currentIndex = next;
      renderValue();
    } else {
      showResults();
    }
  }
}

function prevValue() {
  var activeIndices = getActiveIndices();
  var currentPos = activeIndices.indexOf(currentIndex);
  if (currentPos > 0) {
    currentIndex = activeIndices[currentPos - 1];
    saveProgress();
    renderValue();
  }
}

function skipValue() {
  skippedSet.add(currentIndex);
  saveProgress();

  var activeIndices = getActiveIndices();
  var currentPos = activeIndices.indexOf(currentIndex);
  if (currentPos < activeIndices.length - 1) {
    currentIndex = activeIndices[currentPos + 1];
    renderValue();
  } else {
    var next = findNextUnansweredActive(0);
    if (next !== -1) {
      currentIndex = next;
      renderValue();
    } else {
      renderValue();
    }
  }
}

function findNextUnansweredActive(startFromPos) {
  var activeIndices = getActiveIndices();
  for (var i = startFromPos; i < activeIndices.length; i++) {
    if (!isValueCompleted(activeIndices[i])) return activeIndices[i];
  }
  return -1;
}

function goToNextSkipped() {
  var activeSet = new Set(getActiveIndices());
  var arr = [];
  skippedSet.forEach(function(i) { if (activeSet.has(i)) arr.push(i); });
  arr.sort(function(a, b) { return a - b; });
  if (arr.length > 0) {
    var next = arr.find(function(i) { return i > currentIndex; });
    if (next === undefined) next = arr[0];
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
  var completed = getActiveCompletedCount();
  var total = getActiveTotal();
  if (completed === 0) {
    showModal({
      icon: '\u26A0\uFE0F',
      title: 'No Values Completed',
      message: 'Please complete at least one value before ending the test.',
      buttons: [{ label: 'Got it', cls: 'btn-primary' }]
    });
    return;
  }
  showModal({
    icon: '\uD83C\uDFC1',
    title: 'End Test?',
    message: 'You have completed ' + completed + ' of ' + total + ' values. End now and see results?',
    buttons: [
      { label: 'Cancel', cls: 'btn-secondary' },
      { label: 'See Results', cls: 'btn-primary', action: showResults }
    ]
  });
}

function restartTest() {
  showModal({
    icon: '\uD83D\uDD04',
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
  quizLevel = null;
  Object.keys(answers).forEach(function(k) { delete answers[k]; });
  skippedSet.clear();
  navigateToLanding();
}

// --- Skipped Banner ---

function updateSkippedBanner() {
  var activeSet = new Set(getActiveIndices());
  var count = 0;
  skippedSet.forEach(function(i) { if (activeSet.has(i)) count++; });
  var banner = document.getElementById('skippedBanner');
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
  var activeIndices = getActiveIndices();
  var total = activeIndices.length;
  var completed = getActiveCompletedCount();
  var activeSkipped = 0;
  skippedSet.forEach(function(i) { if (activeIndices.indexOf(i) !== -1) activeSkipped++; });
  var pending = total - completed - activeSkipped;

  document.getElementById('summaryStats').innerHTML =
    '<span class="stat"><span class="stat-dot completed"></span> ' + completed + ' completed</span>' +
    '<span class="stat"><span class="stat-dot skipped"></span> ' + activeSkipped + ' skipped</span>' +
    '<span class="stat"><span class="stat-dot pending"></span> ' + pending + ' remaining</span>';

  var html = '';
  activeIndices.forEach(function(i) {
    var v = VALUES_DATA[i];
    var done = isValueCompleted(i);
    var skip = skippedSet.has(i);
    var active = i === currentIndex ? ' active' : '';
    var icon, scoreText = '';
    if (done) {
      icon = '\u2705';
      var sum = 0;
      for (var qi = 0; qi < 5; qi++) sum += answers[i + '_' + qi] || 0;
      scoreText = (sum / 5).toFixed(1);
    } else if (skip) {
      icon = '\u23ED';
    } else {
      icon = '\u25CB';
    }
    html += '<div class="summary-item' + active + '" onclick="jumpToValue(' + i + ')">' +
      '<span class="status-icon">' + icon + '</span>' +
      '<span class="item-name">' + v.name + '</span>' +
      (scoreText ? '<span class="item-score">' + scoreText + '</span>' : '') +
    '</div>';
  });
  document.getElementById('summaryGrid').innerHTML = html;
}
