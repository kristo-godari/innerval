// Quiz screen: rendering values, answering, skipping, summary panel.

var completionStreak = 0;
var autoAdvanceTimer = null;

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

  // Scroll to the second card (Deep Dive / Recommended) on mobile
  var container = document.querySelector('.level-cards');
  var secondCard = container && container.children[1];
  if (secondCard && window.innerWidth <= 768) {
    requestAnimationFrame(function() {
      secondCard.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'instant' });
    });
  }
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

  // Render segmented progress bar
  renderProgressSegments(activeIndices, currentIndex);

  var desc = VALUE_DESCRIPTIONS[v.name] || '';
  var exploreData = VALUE_EXPLORE_DATA[v.name] || {};
  var emoji = exploreData.emoji || '';
  var category = exploreData.category || '';
  var categoryClass = category ? 'value-card--' + category.toLowerCase().replace(/[^a-z]/g, '') : '';

  // Set category class on the card wrapper
  var cardEl = document.getElementById('valueCard');
  cardEl.className = 'value-card' + (categoryClass ? ' ' + categoryClass : '');

  var html = '<div class="value-header">';
  if (emoji) html += '<div class="value-emoji">' + emoji + '</div>';
  html += '<div class="value-header-text">';
  html += '<div class="value-name">' + v.name + '</div>';
  if (category) html += '<div class="value-category-badge value-cat--' + category.toLowerCase().replace(/[^a-z]/g, '') + '">' + category + '</div>';
  html += '</div></div>';
  if (desc) html += '<div class="value-desc">' + desc + '</div>';
  html += '<div class="value-number"><span class="value-position-pill">Value ' + position + ' of ' + total + '</span> Rate each scenario based on how likely you would do it</div>';

  var areaIcons = {
    'Work': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
    'Relationships': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    'Personal': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    'Social': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'Leisure': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>'
  };
  var areaSlug = function(area) { return area.toLowerCase().replace(/[^a-z]/g, ''); };

  v.questions.forEach(function(q, qi) {
    var key = currentIndex + '_' + qi;
    var saved = answers[key] || 0;
    var areaClass = 'q-area--' + areaSlug(q.area);
    var questionClass = 'question question--' + areaSlug(q.area);
    var statusDot = '<span class="q-status-dot' + (saved ? ' q-status-dot--done' : '') + '"></span>';
    html += '<div class="' + questionClass + '" data-key="' + key + '">';
    html += '<div class="q-area ' + areaClass + '">' + (areaIcons[q.area] || '') + ' ' + q.area + '</div>' + statusDot;
    html += '<div class="q-label">' + q.text + '</div>';
    var chipLabels = ['No way', 'Unlikely', 'Maybe', 'Likely', 'Definitely'];
    html += '<div class="likert">';
    for (var s = 1; s <= 5; s++) {
      html += '<label data-value="' + s + '"><input type="radio" name="q' + key + '" value="' + s + '" ' + (saved === s ? 'checked' : '') + ' onchange="saveAnswer(\'' + key + '\',' + s + ')"><span class="chip">' + chipLabels[s - 1] + '</span></label>';
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

  // Update status dot for this question
  var qEl = document.querySelector('.question[data-key="' + key + '"]');
  if (qEl) {
    var dot = qEl.querySelector('.q-status-dot');
    if (dot) dot.classList.add('q-status-dot--done');
    qEl.classList.remove('unanswered');
  }

  var justCompleted = isValueCompleted(currentIndex);
  if (justCompleted) {
    skippedSet.delete(currentIndex);
    updateSkippedBanner();
    updateSummaryPanel();
    document.getElementById('skipBtn').style.display = 'none';

    // Completion celebration
    completionStreak++;
    triggerCompletionFlash();
    showProgressBadge();
    updateStreakPill();

    // Auto-advance after delay
    if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = setTimeout(function() {
      autoAdvanceTimer = null;
      var activeIndices = getActiveIndices();
      if (getActiveCompletedCount() === activeIndices.length) {
        showResults();
      } else {
        var currentPos = activeIndices.indexOf(currentIndex);
        if (currentPos < activeIndices.length - 1) {
          currentIndex = activeIndices[currentPos + 1];
        } else {
          var next = findNextUnansweredActive(0);
          if (next !== -1) currentIndex = next;
        }
        slideTransition('forward');
      }
    }, 800);
  }
  saveProgress();
}

function triggerCompletionFlash() {
  var card = document.getElementById('valueCard');
  card.classList.add('completed-flash');
  setTimeout(function() { card.classList.remove('completed-flash'); }, 600);
}

function showProgressBadge() {
  var badge = document.getElementById('progressBadge');
  badge.textContent = '+1';
  badge.classList.add('show');
  setTimeout(function() { badge.classList.remove('show'); }, 900);
}

function updateStreakPill() {
  var pill = document.getElementById('streakPill');
  if (completionStreak >= 3) {
    var milestone = (completionStreak % 5 === 0);
    pill.innerHTML = '\uD83D\uDD25 ' + completionStreak + ' in a row';
    pill.style.display = 'inline-flex';
    pill.classList.toggle('streak-milestone', milestone);
    if (milestone) {
      pill.classList.remove('streak-pulse');
      void pill.offsetWidth; // force reflow
      pill.classList.add('streak-pulse');
    }
  } else {
    pill.style.display = 'none';
  }
}

function nextValue() {
  if (!isValueCompleted(currentIndex)) {
    // Highlight unanswered questions inline
    var v = VALUES_DATA[currentIndex];
    var firstUnanswered = null;
    v.questions.forEach(function(q, qi) {
      var key = currentIndex + '_' + qi;
      var qEl = document.querySelector('.question[data-key="' + key + '"]');
      if (!answers[key] && qEl) {
        qEl.classList.add('unanswered');
        if (!firstUnanswered) firstUnanswered = qEl;
      }
    });
    if (firstUnanswered) {
      firstUnanswered.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
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
    slideTransition('forward');
  } else {
    var next = findNextUnansweredActive(0);
    if (next !== -1) {
      currentIndex = next;
      slideTransition('forward');
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
    slideTransition('backward');
  }
}

function skipValue() {
  skippedSet.add(currentIndex);
  completionStreak = 0;
  updateStreakPill();
  saveProgress();

  var activeIndices = getActiveIndices();
  var currentPos = activeIndices.indexOf(currentIndex);
  if (currentPos < activeIndices.length - 1) {
    currentIndex = activeIndices[currentPos + 1];
    slideTransition('forward');
  } else {
    var next = findNextUnansweredActive(0);
    if (next !== -1) {
      currentIndex = next;
      slideTransition('forward');
    } else {
      renderValue();
    }
  }
}

// Slide transition between values
function slideTransition(direction) {
  var card = document.getElementById('valueCard');
  var exitClass = direction === 'forward' ? 'slide-out-left' : 'slide-out-right';
  var enterClass = direction === 'forward' ? 'slide-in-right' : 'slide-in-left';

  card.classList.add(exitClass);
  setTimeout(function() {
    card.classList.remove(exitClass);
    renderValue();
    card.classList.add(enterClass);
    setTimeout(function() {
      card.classList.remove(enterClass);
    }, 350);
  }, 200);
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

// --- Segmented Progress Bar ---

function renderProgressSegments(activeIndices, current) {
  var container = document.getElementById('progressSegments');
  if (!container) {
    // Create container if it doesn't exist yet
    var bar = document.querySelector('.progress-bar');
    container = document.createElement('div');
    container.id = 'progressSegments';
    container.className = 'progress-segments';
    bar.parentNode.insertBefore(container, bar);
  }
  var html = '';
  activeIndices.forEach(function(i) {
    var done = isValueCompleted(i);
    var skip = skippedSet.has(i);
    var isCurrent = i === current;
    var cls = 'progress-segment';
    if (done) cls += ' progress-segment--done';
    else if (skip) cls += ' progress-segment--skipped';
    if (isCurrent) cls += ' progress-segment--current';
    var name = VALUES_DATA[i].name;
    html += '<div class="' + cls + '" title="' + name + '" onclick="jumpToValue(' + i + ')"></div>';
  });
  container.innerHTML = html;
}

// --- Keyboard Navigation ---

document.addEventListener('keydown', function(e) {
  // Only active when quiz is visible
  var quiz = document.getElementById('quiz');
  if (!quiz || quiz.style.display === 'none') return;
  var quizContent = document.getElementById('quizContent');
  if (!quizContent || quizContent.style.display === 'none') return;

  // Ignore if user is typing in an input/textarea
  var tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

  // 1-5: answer focused/first unanswered question
  if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    var val = parseInt(e.key);
    var v = VALUES_DATA[currentIndex];
    // Find first unanswered question, or last question
    var targetQi = -1;
    for (var qi = 0; qi < v.questions.length; qi++) {
      if (!answers[currentIndex + '_' + qi]) { targetQi = qi; break; }
    }
    if (targetQi === -1) targetQi = v.questions.length - 1; // all answered, target last
    var key = currentIndex + '_' + targetQi;
    var radio = document.querySelector('input[name="q' + key + '"][value="' + val + '"]');
    if (radio) {
      radio.checked = true;
      saveAnswer(key, val);
    }
    return;
  }

  // ArrowRight or ArrowDown: next value
  if (e.key === 'ArrowRight' && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    nextValue();
    return;
  }

  // ArrowLeft or ArrowUp: previous value
  if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    prevValue();
    return;
  }

  // 's' or 'S': toggle summary
  if (e.key === 's' || e.key === 'S') {
    e.preventDefault();
    toggleSummary();
    return;
  }
});
