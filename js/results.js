// Results screen: display ranked values, PDF download, JSON export.

const TIER_DEFINITIONS = [
  { label: '🏆 Core Values (Top Tier)', pct: 0.16 },
  { label: '⭐ Very Important', pct: 0.32 },
  { label: '✅ Important', pct: 0.56 },
  { label: '➖ Moderate', pct: 0.80 },
  { label: '📉 Less Important', pct: 1.0 }
];

function showResults() {
  hideAllScreens();
  document.getElementById('results').style.display = 'block';
  saveProgress('results');

  const completedValues = getCompletedValues();
  const totalValues = VALUES_DATA.length;
  const count = completedValues.length;

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

  let html = '';
  let tierIdx = 0;
  let tierStart = 0;

  completedValues.forEach((s, i) => {
    while (tierIdx < tierBounds.length && i >= tierBounds[tierIdx]) {
      tierIdx++;
    }
    if (i === tierStart && tierIdx < TIER_DEFINITIONS.length) {
      html += `<div class="tier-label">${TIER_DEFINITIONS[tierIdx].label}</div>`;
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

function downloadPDF() {
  const element = document.getElementById('results');
  const opt = {
    margin: [10, 10, 10, 10],
    filename: 'innerval-values-report.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };
  html2pdf().set(opt).from(element).save();
}

function exportResultsJSON() {
  const completedValues = getDetailedCompletedValues();
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
