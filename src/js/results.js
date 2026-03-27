// Results screen: display ranked values, PDF download, JSON export.

const TIER_DEFINITIONS = [
  { label: 'Core Values', pct: 0.16, color: 'var(--primary)', bg: 'rgba(192,107,94,.08)' },
  { label: 'Very Important', pct: 0.32, color: 'var(--purple)', bg: 'rgba(155,125,184,.08)' },
  { label: 'Important', pct: 0.56, color: 'var(--green)', bg: 'rgba(90,158,111,.08)' },
  { label: 'Moderate', pct: 0.80, color: 'var(--gold)', bg: 'rgba(212,160,74,.08)' },
  { label: 'Less Important', pct: 1.0, color: 'var(--muted)', bg: 'rgba(138,117,117,.06)' }
];

function showResults() {
  hideAllScreens();
  document.getElementById('results').style.display = 'block';
  saveProgress('results');

  const completedValues = getActiveCompletedValues();
  const totalValues = getActiveTotal();
  const count = completedValues.length;

  // Level badge
  const levelBadge = document.getElementById('resultsLevelBadge');
  const levelKey = quizLevel || 'full-spectrum';
  const levelInfo = QUIZ_LEVELS[levelKey];
  if (levelInfo) {
    levelBadge.textContent = levelInfo.name + ' \u2014 ' + totalValues + ' values';
    levelBadge.style.display = '';
  } else {
    levelBadge.style.display = 'none';
  }

  // Partial results notice
  const notice = document.getElementById('partialNotice');
  if (count < totalValues) {
    notice.style.display = 'block';
    notice.textContent = `Showing results for ${count} of ${totalValues} values. ${totalValues - count} values were skipped.`;
  } else {
    notice.style.display = 'none';
  }

  // Compute tier boundaries
  const tierBounds = TIER_DEFINITIONS.map(t => Math.round(t.pct * count));

  // Theme-consistent bar colors that blend from primary to green
  const BAR_COLORS = ['#c06b5e', '#b87a60', '#9b7db8', '#6aaa78', '#5a9e6f'];

  let html = '';
  let tierIdx = 0;
  let tierStart = 0;

  completedValues.forEach((s, i) => {
    while (tierIdx < tierBounds.length && i >= tierBounds[tierIdx]) {
      tierIdx++;
    }
    if (i === tierStart && tierIdx < TIER_DEFINITIONS.length) {
      const tier = TIER_DEFINITIONS[tierIdx];
      html += `<div class="tier-label" style="background:${tier.bg};border-color:transparent">
        <span class="tier-label-icon" style="background:${tier.bg};color:${tier.color}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </span>
        ${tier.label}
      </div>`;
      tierStart = tierBounds[tierIdx] || count;
    }

    const pct = (s.avg / 5) * 100;
    let rankClass = '';
    if (i === 0) rankClass = 'gold';
    else if (i === 1) rankClass = 'silver';
    else if (i === 2) rankClass = 'bronze';

    // Pick bar color based on score range (high=primary, low=muted)
    const barColorIdx = Math.min(Math.floor(((5 - s.avg) / 4) * BAR_COLORS.length), BAR_COLORS.length - 1);
    const barColor = BAR_COLORS[barColorIdx];

    const desc = VALUE_DESCRIPTIONS[s.name] || '';
    html += `
      <div class="result-row">
        <div class="rank ${rankClass}">#${i + 1}</div>
        <div class="result-info">
          <div class="result-name">${s.name}</div>
          ${desc ? `<div class="result-desc">${desc}</div>` : ''}
          <div class="result-bar-wrap">
            <div class="result-bar" style="width:${pct}%;background:${barColor}"></div>
          </div>
        </div>
        <div class="result-score">${s.avg.toFixed(1)}</div>
      </div>`;
  });

  document.getElementById('resultsList').innerHTML = html;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function downloadPDF() {
  const element = document.getElementById('results');
  // Temporarily constrain width so content fits A4 portrait without clipping
  const origStyles = element.getAttribute('style') || '';
  element.style.width = '180mm';
  element.style.maxWidth = '180mm';
  element.style.boxSizing = 'border-box';
  element.style.overflow = 'hidden';
  element.style.padding = '0 5mm';

  // Manually insert spacer divs before result-rows that would be split across pages.
  // After each spacer insertion, recalculate positions since the DOM shifts.
  // A4 portrait content height = 297mm - 20mm margins = 277mm ≈ 1047px at 96dpi
  const pageHeightPx = 1047;
  const pageBreakers = [];

  var rows = element.querySelectorAll('.result-row');
  for (var i = 0; i < rows.length; i++) {
    var containerTop = element.getBoundingClientRect().top + window.scrollY;
    var rowRect = rows[i].getBoundingClientRect();
    var rowTop = rowRect.top + window.scrollY - containerTop;
    var rowBottom = rowTop + rowRect.height;
    var pageOfTop = Math.floor(rowTop / pageHeightPx);
    var pageOfBottom = Math.floor((rowBottom - 1) / pageHeightPx);
    if (pageOfBottom > pageOfTop) {
      var spacerHeight = (pageOfTop + 1) * pageHeightPx - rowTop;
      var spacer = document.createElement('div');
      spacer.style.height = spacerHeight + 'px';
      spacer.className = 'pdf-page-spacer';
      rows[i].parentNode.insertBefore(spacer, rows[i]);
      pageBreakers.push(spacer);
    }
  }

  const opt = {
    margin: [10, 10, 10, 10],
    filename: 'innerval-results-' + new Date().toISOString().slice(0, 10) + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, scrollY: 0, width: element.scrollWidth },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save().then(function() {
    element.setAttribute('style', origStyles);
    pageBreakers.forEach(function(s) { s.remove(); });
  });
}

function exportResultsJSON() {
  const completedValues = getActiveDetailedCompletedValues();
  const result = buildExportData(completedValues);

  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'innerval-results-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
