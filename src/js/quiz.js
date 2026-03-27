// Quiz screen: area selection, question pages, navigation.

var completionStreak = 0;
var autoAdvanceTimer = null;

var AREA_DESCRIPTIONS = {
  Work: 'Career decisions, workplace dynamics, and professional growth',
  Relationships: 'Partners, family bonds, and close personal connections',
  Personal: 'Self-reflection, inner life, and individual choices',
  Social: 'Community involvement, social situations, and public life',
  Leisure: 'Hobbies, recreation, free time, and personal enjoyment'
};

function getAreaIcon(area, size) {
  var s = size || 24;
  var icons = {
    Work: '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
    Relationships: '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    Personal: '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    Social: '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    Leisure: '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>'
  };
  return icons[area] || '';
}

function areaSlug(area) {
  return area.toLowerCase().replace(/[^a-z]/g, '');
}

// --- Quiz Entry Points ---

function startQuiz() {
  var saved = loadProgress();
  var hasResults = saved && saved.screen === 'results' && Object.keys(saved.answers).length > 0;
  var hasProgress = saved && saved.screen === 'quiz' && Object.keys(saved.answers).length > 0;

  if (hasResults || hasProgress) {
    showModal({
      icon: 'info',
      title: 'Test in Progress',
      message: 'You have an existing test in progress. Would you like to continue where you left off or start a new test?',
      buttons: [
        { label: 'Start New Test', cls: 'btn-end', action: function() { resetQuizState(); showLevelSelect(); } },
        { label: 'Continue', cls: 'btn-primary', action: function() { resumeQuiz(saved, hasResults); } }
      ]
    });
    return;
  }

  showLevelSelect();
}

function resumeQuiz(saved, hasResults) {
  quizLevel = saved.quizLevel || 'full-spectrum';
  hideAllScreens();
  document.getElementById('quiz').style.display = 'block';
  Object.entries(saved.answers).forEach(function(entry) { answers[entry[0]] = entry[1]; });
  currentIndex = saved.currentIndex || 0;
  currentArea = saved.currentArea || null;
  currentAreaPage = saved.currentAreaPage || 0;
  (saved.skipped || []).forEach(function(i) { skippedSet.add(i); });

  if (hasResults) {
    showPreviousResultsBanner(true);
  } else {
    showPreviousResultsBanner(false);
    if (currentArea) {
      showQuizContent();
      renderAreaPage();
    } else {
      showAreaSelect();
    }
  }
}

function showLevelSelect() {
  hideAllScreens();
  document.getElementById('levelSelect').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });

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
  currentArea = null;
  currentAreaPage = 0;
  Object.keys(answers).forEach(function(k) { delete answers[k]; });
  skippedSet.clear();

  hideAllScreens();
  document.getElementById('quiz').style.display = 'block';
  showPreviousResultsBanner(false);
  saveProgress();
  showAreaSelect();
}

function showPreviousResultsBanner(show) {
  document.getElementById('previousResultsBanner').style.display = show ? 'flex' : 'none';
  if (show) {
    document.getElementById('areaSelect').style.display = 'none';
    document.getElementById('quizContent').style.display = 'none';
  }
}

function viewPreviousResults() {
  showPreviousResultsBanner(false);
  showResults();
}

function startNewTest() {
  showPreviousResultsBanner(false);
  clearProgress();
  currentIndex = 0;
  currentArea = null;
  currentAreaPage = 0;
  quizLevel = null;
  Object.keys(answers).forEach(function(k) { delete answers[k]; });
  skippedSet.clear();
  showLevelSelect();
}

// --- Area Select Screen ---

function showAreaSelect() {
  document.getElementById('areaSelect').style.display = 'block';
  document.getElementById('quizContent').style.display = 'none';
  currentArea = null;
  saveProgress();
  renderAreaSelect();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showQuizContent() {
  document.getElementById('areaSelect').style.display = 'none';
  document.getElementById('quizContent').style.display = '';
}

function renderAreaSelect() {
  var container = document.getElementById('areaCards');
  var activeIndices = getActiveIndices();
  var totalQuestions = activeIndices.length * 5;
  var totalAnswered = 0;

  var html = '';
  LIFE_AREAS.forEach(function(area) {
    var questions = getAreaQuestions(area);
    var answered = getAreaAnsweredCount(area);
    var total = questions.length;
    var complete = answered === total;
    var pct = total > 0 ? Math.round((answered / total) * 100) : 0;
    totalAnswered += answered;

    var slug = areaSlug(area);
    var statusClass = complete ? 'area-card--complete' : (answered > 0 ? 'area-card--progress' : '');
    var statusText = complete ? 'Completed' : (answered > 0 ? 'In Progress' : 'Not Started');
    var btnText = complete ? 'Review' : (answered > 0 ? 'Continue' : 'Start');

    html += '<div class="area-card area-card--' + slug + ' ' + statusClass + '" onclick="selectArea(\'' + area + '\')">';
    html += '<div class="area-card-header">';
    html += '<div class="area-card-icon">' + getAreaIcon(area, 28) + '</div>';
    html += '<div class="area-card-status">' + statusText + '</div>';
    html += '</div>';
    html += '<h3 class="area-card-name">' + area + '</h3>';
    html += '<p class="area-card-desc">' + AREA_DESCRIPTIONS[area] + '</p>';
    html += '<div class="area-card-progress">';
    html += '<div class="area-card-progress-bar"><div class="area-card-progress-fill area-card-progress-fill--' + slug + '" style="width:' + pct + '%"></div></div>';
    html += '<span class="area-card-progress-text">' + answered + ' / ' + total + '</span>';
    html += '</div>';
    html += '<div class="area-card-btn area-card-btn--' + slug + '">' + btnText + ' <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></div>';
    html += '</div>';
  });

  container.innerHTML = html;

  // Update overall progress
  var overallPct = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;
  document.getElementById('areaOverallLabel').textContent = totalAnswered + ' of ' + totalQuestions + ' questions answered';
  document.getElementById('areaOverallPct').textContent = overallPct + '%';
  document.getElementById('areaOverallFill').style.width = overallPct + '%';

  // Check if all areas complete
  if (getAllAreasComplete() && totalAnswered > 0) {
    var resultsHint = document.getElementById('areaResultsHint');
    if (resultsHint) {
      resultsHint.style.display = 'block';
    }
  }

  // Show End Test button only when at least one value is fully completed
  var endBtn = document.getElementById('endTestBtnArea');
  if (endBtn) {
    endBtn.style.display = getActiveCompletedCount() > 0 ? '' : 'none';
  }
}

function selectArea(area) {
  currentArea = area;
  currentAreaPage = 0;

  // Find first page with unanswered questions
  var questions = getAreaQuestions(area);
  var totalPages = getAreaPageCount(area);
  for (var p = 0; p < totalPages; p++) {
    var pageQs = questions.slice(p * 5, (p + 1) * 5);
    var allAnswered = pageQs.every(function(q) { return !!answers[q.key]; });
    if (!allAnswered) {
      currentAreaPage = p;
      break;
    }
  }

  showQuizContent();
  saveProgress();
  renderAreaPage();
}

// --- Question Page Rendering ---

function renderAreaPage() {
  var area = currentArea;
  var questions = getAreaQuestions(area);
  var totalPages = getAreaPageCount(area);
  var pageQuestions = questions.slice(currentAreaPage * 5, (currentAreaPage + 1) * 5);
  var areaAnswered = getAreaAnsweredCount(area);
  var areaTotal = questions.length;
  var areaPct = Math.round((areaAnswered / areaTotal) * 100);
  var slug = areaSlug(area);

  // Render area tabs
  renderAreaTabs();

  // Update progress
  document.getElementById('progressLabel').textContent = area + ': ' + areaAnswered + ' of ' + areaTotal + ' answered';
  document.getElementById('progressPct').textContent = areaPct + '%';
  document.getElementById('progressFill').style.width = areaPct + '%';

  // Render page segments
  renderPageSegments(totalPages, currentAreaPage);

  // Render questions
  var cardEl = document.getElementById('valueCard');
  cardEl.className = 'value-card';

  var html = '<div class="value-number"><span class="value-position-pill value-position-pill--' + slug + '">' + area + '</span> Page ' + (currentAreaPage + 1) + ' of ' + totalPages + ' &mdash; Rate each scenario based on how likely you would do it</div>';

  var chipLabels = ['No way', 'Unlikely', 'Maybe', 'Likely', 'Definitely'];

  var checkSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  pageQuestions.forEach(function(q, idx) {
    var saved = answers[q.key] || 0;
    var answeredCls = saved ? ' question--answered' : '';
    html += '<div class="question' + answeredCls + '" data-key="' + q.key + '">';
    html += '<div class="q-header">';
    html += '<span class="q-number">Question ' + (currentAreaPage * 5 + idx + 1) + '</span>';
    html += '<span class="q-check">' + checkSvg + '</span>';
    html += '</div>';
    html += '<div class="q-label">' + q.text + '</div>';
    html += '<div class="likert">';
    for (var s = 1; s <= 5; s++) {
      html += '<label data-value="' + s + '"><input type="radio" name="q' + q.key + '" value="' + s + '" ' + (saved === s ? 'checked' : '') + ' onchange="saveAnswer(\'' + q.key + '\',' + s + ')"><span class="chip">' + chipLabels[s - 1] + '</span></label>';
    }
    html += '</div>';
    html += '</div>';
  });

  cardEl.innerHTML = html;

  // Update navigation buttons
  document.getElementById('prevBtn').disabled = currentAreaPage === 0;

  var nextBtn = document.getElementById('nextBtn');
  var arrowSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';

  if (currentAreaPage === totalPages - 1 && isAreaComplete(area)) {
    nextBtn.innerHTML = getAllAreasComplete() ? 'See Results ' + arrowSvg : 'Next Area ' + arrowSvg;
  } else {
    nextBtn.innerHTML = 'Next ' + arrowSvg;
  }

  // Hide elements not used in area flow
  document.getElementById('skipBtn').style.display = 'none';
  document.getElementById('skippedBanner').style.display = 'none';
  document.getElementById('streakPill').style.display = 'none';

  // Show End Test button only when at least one value is fully completed
  var endBtnQuiz = document.getElementById('endTestBtnQuiz');
  if (endBtnQuiz) {
    endBtnQuiz.style.display = getActiveCompletedCount() > 0 ? '' : 'none';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderAreaTabs() {
  var container = document.getElementById('areaTabs');
  if (!container) {
    var progressWrap = document.querySelector('#quizContent .progress-wrap');
    container = document.createElement('div');
    container.id = 'areaTabs';
    container.className = 'area-tabs';
    progressWrap.parentNode.insertBefore(container, progressWrap);
  }

  var checkSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  var html = '';
  LIFE_AREAS.forEach(function(area) {
    var complete = isAreaComplete(area);
    var inProgress = getAreaAnsweredCount(area) > 0 && !complete;
    var isCurrent = area === currentArea;
    var slug = areaSlug(area);

    var cls = 'area-tab area-tab--' + slug;
    if (isCurrent) cls += ' area-tab--active';
    if (complete) cls += ' area-tab--complete';
    else if (inProgress) cls += ' area-tab--progress';

    html += '<button class="' + cls + '" onclick="switchArea(\'' + area + '\')">';
    html += '<span class="area-tab-icon">' + getAreaIcon(area, 14) + '</span>';
    html += '<span class="area-tab-label">' + area + '</span>';
    if (complete) html += '<span class="area-tab-check">' + checkSvg + '</span>';
    html += '</button>';
  });

  container.innerHTML = html;
}

function renderPageSegments(totalPages, currentPage) {
  var container = document.getElementById('progressSegments');
  if (!container) {
    var bar = document.querySelector('#quizContent .progress-bar');
    container = document.createElement('div');
    container.id = 'progressSegments';
    container.className = 'progress-segments';
    bar.parentNode.insertBefore(container, bar);
  }

  var questions = getAreaQuestions(currentArea);

  var html = '';
  for (var p = 0; p < totalPages; p++) {
    var pageQs = questions.slice(p * 5, (p + 1) * 5);
    var pageDone = pageQs.every(function(q) { return !!answers[q.key]; });
    var isCurrent = p === currentPage;

    var cls = 'progress-segment';
    if (pageDone) cls += ' progress-segment--done';
    if (isCurrent) cls += ' progress-segment--current';

    html += '<div class="' + cls + '" onclick="jumpToPage(' + p + ')"></div>';
  }

  container.innerHTML = html;
}

// --- Navigation ---

function switchArea(area) {
  if (area === currentArea) return;
  currentArea = area;
  currentAreaPage = 0;

  // Find first page with unanswered questions
  var questions = getAreaQuestions(area);
  var totalPages = getAreaPageCount(area);
  for (var p = 0; p < totalPages; p++) {
    var pageQs = questions.slice(p * 5, (p + 1) * 5);
    var allAnswered = pageQs.every(function(q) { return !!answers[q.key]; });
    if (!allAnswered) {
      currentAreaPage = p;
      break;
    }
  }

  saveProgress();
  slideTransition('forward');
}

function jumpToPage(page) {
  if (page === currentAreaPage) return;
  var direction = page > currentAreaPage ? 'forward' : 'backward';
  currentAreaPage = page;
  saveProgress();
  slideTransition(direction);
}

function nextPage() {
  // Check if all questions on current page are answered
  var questions = getAreaQuestions(currentArea);
  var pageQuestions = questions.slice(currentAreaPage * 5, (currentAreaPage + 1) * 5);
  var hasUnanswered = false;

  var firstUnanswered = null;
  pageQuestions.forEach(function(q) {
    if (!answers[q.key]) {
      hasUnanswered = true;
      var qEl = document.querySelector('.question[data-key="' + q.key + '"]');
      if (qEl) {
        qEl.classList.add('unanswered');
        if (!firstUnanswered) firstUnanswered = qEl;
      }
    }
  });

  if (hasUnanswered) {
    if (firstUnanswered) {
      firstUnanswered.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  var totalPages = getAreaPageCount(currentArea);

  if (currentAreaPage < totalPages - 1) {
    currentAreaPage++;
    saveProgress();
    slideTransition('forward');
  } else {
    // Last page of area, area is complete
    if (getAllAreasComplete()) {
      showResults();
    } else {
      backToAreaSelect();
    }
  }
}

function prevPage() {
  if (currentAreaPage > 0) {
    currentAreaPage--;
    saveProgress();
    slideTransition('backward');
  }
}

function backToAreaSelect() {
  showAreaSelect();
}

// --- Answer Saving ---

function saveAnswer(key, val) {
  answers[key] = val;

  // Update answered state and reorder: move answered question to bottom
  var qEl = document.querySelector('.question[data-key="' + key + '"]');
  if (qEl) {
    qEl.classList.add('question--answered');
    qEl.classList.remove('unanswered');
    reorderQuestions(qEl);
  }

  // Check if all questions on current page are answered
  var questions = getAreaQuestions(currentArea);
  var pageQuestions = questions.slice(currentAreaPage * 5, (currentAreaPage + 1) * 5);
  var allPageAnswered = pageQuestions.every(function(q) { return !!answers[q.key]; });

  if (allPageAnswered) {
    completionStreak++;
    triggerCompletionFlash();
    showProgressBadge();

    // Auto-advance after delay
    if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = setTimeout(function() {
      autoAdvanceTimer = null;
      var totalPages = getAreaPageCount(currentArea);

      if (currentAreaPage < totalPages - 1) {
        currentAreaPage++;
        saveProgress();
        slideTransition('forward');
      } else if (getAllAreasComplete()) {
        showResults();
      } else {
        backToAreaSelect();
      }
    }, 800);
  }

  // Update progress display
  var areaAnswered = getAreaAnsweredCount(currentArea);
  var areaTotal = questions.length;
  var areaPct = Math.round((areaAnswered / areaTotal) * 100);
  document.getElementById('progressLabel').textContent = currentArea + ': ' + areaAnswered + ' of ' + areaTotal + ' answered';
  document.getElementById('progressPct').textContent = areaPct + '%';
  document.getElementById('progressFill').style.width = areaPct + '%';

  // Update segments, tabs, and End Test button visibility
  renderPageSegments(getAreaPageCount(currentArea), currentAreaPage);
  renderAreaTabs();

  var endBtnQuiz = document.getElementById('endTestBtnQuiz');
  if (endBtnQuiz) {
    endBtnQuiz.style.display = getActiveCompletedCount() > 0 ? '' : 'none';
  }

  // Update next button text
  var totalPages = getAreaPageCount(currentArea);
  if (currentAreaPage === totalPages - 1 && isAreaComplete(currentArea)) {
    var nextBtn = document.getElementById('nextBtn');
    var arrowSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
    nextBtn.innerHTML = getAllAreasComplete() ? 'See Results ' + arrowSvg : 'Next Area ' + arrowSvg;
  }

  saveProgress();
}

// --- Reorder Questions (move answered to bottom) ---

function reorderQuestions(answeredEl) {
  var parent = answeredEl.parentNode;
  var allQuestions = Array.prototype.slice.call(parent.querySelectorAll('.question'));

  // Check if there are unanswered questions below this one
  var hasUnansweredBelow = false;
  var pastAnswered = false;
  allQuestions.forEach(function(q) {
    if (q === answeredEl) { pastAnswered = true; return; }
    if (pastAnswered && !q.classList.contains('question--answered')) {
      hasUnansweredBelow = true;
    }
  });

  if (!hasUnansweredBelow) return; // Already at the right position

  // Animate out, move, animate in
  answeredEl.classList.add('reorder-out');
  setTimeout(function() {
    // Move all unanswered questions to the top, answered to the bottom
    var unanswered = [];
    var answered = [];
    allQuestions.forEach(function(q) {
      if (q.classList.contains('question--answered')) {
        answered.push(q);
      } else {
        unanswered.push(q);
      }
    });

    // Re-append in order: unanswered first, then answered
    unanswered.concat(answered).forEach(function(q) {
      parent.appendChild(q);
    });

    answeredEl.classList.remove('reorder-out');
    answeredEl.classList.add('reorder-in');


    setTimeout(function() {
      answeredEl.classList.remove('reorder-in');
    }, 350);
  }, 300);
}

// --- Completion Effects ---

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

// --- Slide Transition ---

function slideTransition(direction) {
  var card = document.getElementById('valueCard');
  var exitClass = direction === 'forward' ? 'slide-out-left' : 'slide-out-right';
  var enterClass = direction === 'forward' ? 'slide-in-right' : 'slide-in-left';

  card.classList.add(exitClass);
  setTimeout(function() {
    card.classList.remove(exitClass);
    renderAreaPage();
    card.classList.add(enterClass);
    setTimeout(function() {
      card.classList.remove(enterClass);
    }, 350);
  }, 200);
}

// --- End / Restart ---

function endTest() {
  var completed = getActiveCompletedCount();
  var total = getActiveTotal();

  showModal({
    icon: 'flag',
    title: 'End Test?',
    message: 'You have ' + completed + ' of ' + total + ' values fully scored across all life areas. End now and see results?',
    buttons: [
      { label: 'Cancel', cls: 'btn-secondary' },
      { label: 'See Results', cls: 'btn-primary', action: showResults }
    ]
  });
}

function restartTest() {
  showModal({
    icon: 'restart',
    title: 'Restart Test?',
    message: 'This will erase all your progress. Are you sure?',
    buttons: [
      { label: 'Cancel', cls: 'btn-secondary' },
      { label: 'Restart', cls: 'btn-end', action: doRestart }
    ]
  });
}

function resetQuizState() {
  clearProgress();
  currentIndex = 0;
  currentArea = null;
  currentAreaPage = 0;
  quizLevel = null;
  Object.keys(answers).forEach(function(k) { delete answers[k]; });
  skippedSet.clear();
}

function doRestart() {
  resetQuizState();
  navigateToLanding();
}

// --- Keyboard Navigation ---

document.addEventListener('keydown', function(e) {
  var quiz = document.getElementById('quiz');
  if (!quiz || quiz.style.display === 'none') return;
  var quizContent = document.getElementById('quizContent');
  if (!quizContent || quizContent.style.display === 'none') return;
  if (!currentArea) return;

  var tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

  // 1-5: answer first unanswered question on page
  if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    var val = parseInt(e.key);
    var questions = getAreaQuestions(currentArea);
    var pageQuestions = questions.slice(currentAreaPage * 5, (currentAreaPage + 1) * 5);

    var targetQ = null;
    for (var i = 0; i < pageQuestions.length; i++) {
      if (!answers[pageQuestions[i].key]) { targetQ = pageQuestions[i]; break; }
    }
    if (!targetQ && pageQuestions.length > 0) targetQ = pageQuestions[pageQuestions.length - 1];

    if (targetQ) {
      var radio = document.querySelector('input[name="q' + targetQ.key + '"][value="' + val + '"]');
      if (radio) {
        radio.checked = true;
        saveAnswer(targetQ.key, val);
      }
    }
    return;
  }

  if (e.key === 'ArrowRight' && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    nextPage();
    return;
  }

  if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    prevPage();
    return;
  }
});
