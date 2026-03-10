// Growth plan: prompt generation and UI.

function showGrowthPlan() {
  const results = getCompletedValues();
  const hasResults = results.length > 0;
  const hasAspirations = aspirations.size > 0;

  if (!hasResults && !hasAspirations) {
    showModal({
      icon: '📋',
      title: 'Nothing to Plan Yet',
      message: 'Take the assessment to discover your values, or add aspirations — values you want to cultivate.',
      buttons: [{ label: 'Got it', cls: 'btn-primary' }]
    });
    return;
  }
  hideAllScreens();
  document.getElementById('growthPlan').style.display = 'block';
  renderGrowthPlan();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderGrowthPlan() {
  const results = getCompletedValues();
  const hasResults = results.length > 0;
  const aspirationNames = [...aspirations];
  const hasAspirations = aspirationNames.length > 0;

  renderPlanContext(results, hasResults, aspirationNames, hasAspirations);

  const prompt = buildGrowthPrompt(hasResults ? results : null, aspirationNames);
  document.getElementById('planPromptText').textContent = prompt;

  // Reset copy button
  const copyBtn = document.getElementById('copyPromptBtn');
  copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Prompt';
}

function renderPlanContext(results, hasResults, aspirationNames, hasAspirations) {
  const contextEl = document.getElementById('planContext');
  let html = '';

  if (hasResults) {
    const topValues = results.slice(0, 5).map(v => v.name + ' (' + v.avg.toFixed(1) + '/5)');
    html += '<div class="plan-context-card plan-context-values">' +
      '<div class="plan-context-icon">🧭</div>' +
      '<div class="plan-context-info">' +
        '<strong>My Values</strong> — discovered from your assessment' +
        '<div class="plan-context-detail">Top values: ' + topValues.join(', ') + '</div>' +
      '</div>' +
    '</div>';
  }

  if (hasAspirations) {
    html += '<div class="plan-context-card plan-context-aspirations">' +
      '<div class="plan-context-icon">⭐</div>' +
      '<div class="plan-context-info">' +
        '<strong>My Aspirations</strong> — values you want to cultivate' +
        '<div class="plan-context-detail">' + aspirationNames.join(', ') + '</div>' +
      '</div>' +
    '</div>';
  }

  if (hasResults && !hasAspirations) {
    html += '<div class="plan-context-tip">💡 Add aspirations in Explore Values to get a richer plan that bridges your current values with where you want to grow.</div>';
  } else if (!hasResults && hasAspirations) {
    html += '<div class="plan-context-tip">💡 Take the assessment to discover your current values — your plan will be even more personalised.</div>';
  }

  contextEl.innerHTML = html;
}

function buildGrowthPrompt(results, aspirationNames) {
  const hasResults = results && results.length > 0;
  const hasAspirations = aspirationNames && aspirationNames.length > 0;

  let prompt = 'I want to create a personal growth plan to cultivate specific values in my life. ';
  prompt += 'Please create a detailed, step-by-step plan with concrete daily routines, weekly practices, and monthly milestones that will help me develop these values.\n\n';

  if (hasResults) {
    prompt += buildResultsSection(results, hasAspirations, aspirationNames);
  }

  if (hasAspirations) {
    prompt += '=== MY ASPIRATIONS (values I want to cultivate) ===\n';
    aspirationNames.forEach(name => {
      const data = VALUE_EXPLORE_DATA[name];
      prompt += data ? '- ' + name + ': ' + data.shortDesc + '\n' : '- ' + name + '\n';
    });
    prompt += '\n';
  }

  prompt += buildInstructionsSection(hasResults, hasAspirations);
  prompt += '\nMake the plan practical, actionable, and realistic for someone with a busy schedule. ';
  prompt += 'Focus on small, consistent actions rather than dramatic changes. ';
  prompt += 'Use a warm, encouraging tone.';

  return prompt;
}

function buildResultsSection(results, hasAspirations, aspirationNames) {
  const count = results.length;
  const tiers = [
    { label: 'Core Values', pct: 0.16 },
    { label: 'Very Important', pct: 0.32 },
    { label: 'Important', pct: 0.56 },
    { label: 'Moderate', pct: 0.80 },
    { label: 'Less Important', pct: 1.0 }
  ];

  let section = '=== MY VALUES (from assessment) ===\n';
  section += 'I recently completed a personal values assessment where I rated ' + count + ' values. ';
  section += 'Here are my results ranked from most to least important:\n\n';

  let tierIdx = 0;
  results.forEach((v, i) => {
    const pct = (i + 1) / count;
    while (tierIdx < tiers.length - 1 && pct > tiers[tierIdx].pct) tierIdx++;
    if (i < 10 || (hasAspirations && aspirationNames.includes(v.name))) {
      section += '  ' + (i + 1) + '. ' + v.name + ' — ' + v.avg.toFixed(1) + '/5';
      if (i === 0) section += ' [strongest]';
      section += '\n';
    }
  });

  section += '\nMy strongest values (already well-developed): ';
  section += results.slice(0, 5).map(v => v.name).join(', ') + '\n';

  if (hasAspirations) {
    const resultMap = {};
    results.forEach(v => { resultMap[v.name] = v.avg; });
    const aspirationsInResults = aspirationNames.filter(n => resultMap[n] !== undefined);
    if (aspirationsInResults.length > 0) {
      section += '\nCurrent scores for my aspiration values:\n';
      aspirationsInResults.forEach(name => {
        section += '  - ' + name + ': ' + resultMap[name].toFixed(1) + '/5\n';
      });
    }
  }

  return section + '\n';
}

function buildInstructionsSection(hasResults, hasAspirations) {
  let section = '=== WHAT I NEED FROM YOU ===\nPlease provide:\n';

  if (hasResults && hasAspirations) {
    section += '1. A brief analysis of how my current values and aspirations relate — where I am vs where I want to be\n';
    section += '2. For EACH aspiration value, provide:\n';
    section += '   a. Why this value matters and how it connects to a fulfilling life\n';
    section += '   b. 2-3 daily micro-habits or routines (5-15 minutes each) to practise this value\n';
    section += '   c. 1-2 weekly practices or exercises (30-60 minutes) to deepen this value\n';
    section += '   d. A monthly reflection prompt or milestone to track growth\n';
    section += '   e. Common obstacles and how to overcome them\n';
    section += '3. A suggested morning and evening routine that integrates the aspiration values\n';
    section += '4. A 90-day roadmap broken into three phases (Foundation, Practice, Integration)\n';
    section += '5. Ways to measure progress and signs that the values are becoming part of who I am\n';
    section += '\nIMPORTANT: Consider my existing strong values as strengths to build on. ';
    section += 'Show me how my current values can support and accelerate the cultivation of my aspiration values. ';
    section += 'For aspiration values where I scored low, provide extra attention and gentler starting points.\n';
  } else if (hasResults) {
    section += '1. An analysis of my values profile — what my top values reveal about who I am\n';
    section += '2. For my top 5 values, provide:\n';
    section += '   a. How to lean into this strength more intentionally\n';
    section += '   b. 1-2 daily practices to live this value more fully\n';
    section += '   c. Potential blind spots when this value is overemphasised\n';
    section += '3. For my weakest 3 values, suggest:\n';
    section += '   a. Whether growing these would benefit me, and why\n';
    section += '   b. Gentle starting points if I want to develop them\n';
    section += '4. A suggested morning and evening routine aligned with my core values\n';
    section += '5. A 90-day roadmap to live more intentionally according to my values\n';
  } else {
    section += '1. A brief analysis of my aspirations\n';
    section += '2. For EACH aspiration value, provide:\n';
    section += '   a. Why this value matters and how it connects to a fulfilling life\n';
    section += '   b. 2-3 daily micro-habits or routines (5-15 minutes each) to practise this value\n';
    section += '   c. 1-2 weekly practices or exercises (30-60 minutes) to deepen this value\n';
    section += '   d. A monthly reflection prompt or milestone to track growth\n';
    section += '   e. Common obstacles and how to overcome them\n';
    section += '3. A suggested morning and evening routine that integrates all the aspiration values\n';
    section += '4. A 90-day roadmap broken into three phases (Foundation, Practice, Integration)\n';
    section += '5. Ways to measure progress and signs that the values are becoming part of who I am\n';
  }

  return section;
}

function copyPlanPrompt() {
  const text = document.getElementById('planPromptText').textContent;
  navigator.clipboard.writeText(text).then(function() {
    const btn = document.getElementById('copyPromptBtn');
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg> Copied!';
    btn.classList.add('copied');
    setTimeout(function() {
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Prompt';
      btn.classList.remove('copied');
    }, 2000);
  });
}

function backToExploreFromPlan() {
  hideAllScreens();
  document.getElementById('exploreValues').style.display = 'block';
  loadAspirations();
  renderExploreGrid();
  renderMyValuesPanel();
  updateAspirationsUI();
  updatePlanCta();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
