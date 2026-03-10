// Growth plan: prompt generation and UI.

var GROWTH_TIERS = [
  { label: 'Core Values', pct: 0.16 },
  { label: 'Very Important', pct: 0.32 },
  { label: 'Important', pct: 0.56 },
  { label: 'Moderate', pct: 0.80 },
  { label: 'Less Important', pct: 1.0 }
];

var GROWTH_PROMPTS = (function() {
  var prompts = {};
  var sections = GROWTH_PROMPTS_TEXT.split(/^===([A-Z_]+)===$/gm);
  for (var i = 1; i < sections.length; i += 2) {
    prompts[sections[i]] = sections[i + 1].trim();
  }
  return prompts;
})();

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
  const P = GROWTH_PROMPTS;

  let prompt = P.INTRO + '\n\n';

  if (hasResults) {
    prompt += buildResultsSection(results, hasAspirations, aspirationNames);
  }

  if (hasAspirations) {
    prompt += P.ASPIRATIONS_HEADER + '\n';
    aspirationNames.forEach(name => {
      const data = VALUE_EXPLORE_DATA[name];
      prompt += data ? '- ' + name + ': ' + data.shortDesc + '\n' : '- ' + name + '\n';
    });
    prompt += '\n';
  }

  prompt += buildInstructionsSection(hasResults, hasAspirations);
  prompt += '\n' + P.CLOSING;

  return prompt;
}

function buildResultsSection(results, hasAspirations, aspirationNames) {
  const count = results.length;
  const P = GROWTH_PROMPTS;
  const tiers = GROWTH_TIERS;

  let section = P.RESULTS_HEADER + '\n';
  section += P.RESULTS_INTRO.replace('{count}', count) + '\n\n';

  let tierIdx = 0;
  results.forEach((v, i) => {
    const pct = (i + 1) / count;
    while (tierIdx < tiers.length - 1 && pct > tiers[tierIdx].pct) tierIdx++;
    if (i < 10 || (hasAspirations && aspirationNames.includes(v.name))) {
      section += '  ' + (i + 1) + '. ' + v.name + ' — ' + v.avg.toFixed(1) + '/5';
      if (i === 0) section += P.STRONGEST_LABEL;
      section += '\n';
    }
  });

  section += '\n' + P.STRONGEST_VALUES_PREFIX + ' ';
  section += results.slice(0, 5).map(v => v.name).join(', ') + '\n';

  if (hasAspirations) {
    const resultMap = {};
    results.forEach(v => { resultMap[v.name] = v.avg; });
    const aspirationsInResults = aspirationNames.filter(n => resultMap[n] !== undefined);
    if (aspirationsInResults.length > 0) {
      section += '\n' + P.ASPIRATIONS_SCORES_HEADER + '\n';
      aspirationsInResults.forEach(name => {
        section += '  - ' + name + ': ' + resultMap[name].toFixed(1) + '/5\n';
      });
    }
  }

  return section + '\n';
}

function buildInstructionsSection(hasResults, hasAspirations) {
  const P = GROWTH_PROMPTS;
  let section = P.INSTRUCTIONS_HEADER + '\n';

  if (hasResults && hasAspirations) {
    section += P.INSTRUCTIONS_RESULTS_AND_ASPIRATIONS + '\n';
    section += '\n' + P.INSTRUCTIONS_RESULTS_AND_ASPIRATIONS_NOTE + '\n';
  } else if (hasResults) {
    section += P.INSTRUCTIONS_RESULTS_ONLY + '\n';
  } else {
    section += P.INSTRUCTIONS_ASPIRATIONS_ONLY + '\n';
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
