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
  // Check if pdfMake library loaded
  if (typeof pdfMake === 'undefined') {
    showModal({
      icon: 'error',
      title: 'PDF Library Not Loaded',
      message: 'The PDF generation library failed to load. Please refresh the page and try again.',
      buttons: [{ label: 'OK', cls: 'btn-primary' }]
    });
    return;
  }

  const completedValues = getActiveCompletedValues();
  const totalValues = getActiveTotal();
  const levelKey = quizLevel || 'full-spectrum';
  const levelInfo = QUIZ_LEVELS[levelKey];

  if (!completedValues || completedValues.length === 0) {
    showModal({
      icon: 'warning',
      title: 'No Results',
      message: 'Complete at least one value before generating a PDF.',
      buttons: [{ label: 'Got it', cls: 'btn-primary' }]
    });
    return;
  }

  try {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    // Map tier colors from CSS variables to hex
    const TIER_COLORS_PDF = {
      'Core Values': { bg: '#fce8e5', text: '#c06b5e' },
      'Very Important': { bg: '#f3edf7', text: '#9b7db8' },
      'Important': { bg: '#e8f5ec', text: '#5a9e6f' },
      'Moderate': { bg: '#fdf6e8', text: '#d4a04a' },
      'Less Important': { bg: '#f5f3f2', text: '#8a7575' }
    };

    // Compute tier boundaries
    const count = completedValues.length;
    const tierBounds = TIER_DEFINITIONS.map(t => Math.round(t.pct * count));

    // Build table body with tier headers
    const tableBody = [
      [
        { text: 'Rank', style: 'tableHeader', alignment: 'center' },
        { text: 'Value', style: 'tableHeader' },
        { text: 'Score', style: 'tableHeader', alignment: 'center' }
      ]
    ];

    let currentTierIdx = 0;
    let tierStart = 0;

    completedValues.forEach((value, i) => {
      // Check tier boundary
      while (currentTierIdx < tierBounds.length && i >= tierBounds[currentTierIdx]) {
        currentTierIdx++;
      }

      // Insert tier header at start of each tier
      if (i === tierStart && currentTierIdx < TIER_DEFINITIONS.length) {
        const tier = TIER_DEFINITIONS[currentTierIdx];
        const tierColors = TIER_COLORS_PDF[tier.label];

        tableBody.push([
          {
            text: tier.label.toUpperCase(),
            colSpan: 3,
            style: 'tierHeader',
            fillColor: tierColors.bg,
            color: tierColors.text,
            margin: [0, 4, 0, 4]
          },
          {},
          {}
        ]);

        tierStart = tierBounds[currentTierIdx] || count;
      }

      // Add value row with description
      const desc = VALUE_DESCRIPTIONS[value.name] || '';
      const valueCell = desc
        ? {
            stack: [
              { text: value.name, style: 'valueName' },
              { text: desc, style: 'valueDesc' }
            ]
          }
        : { text: value.name, style: 'valueName' };

      tableBody.push([
        { text: `#${i + 1}`, alignment: 'center', style: 'rank' },
        valueCell,
        { text: value.avg.toFixed(1), alignment: 'center', style: 'score' }
      ]);
    });

    const docDefinition = {
      info: {
        title: 'Innerval - Personal Values Assessment Results',
        author: 'Innerval',
        subject: 'Personal Values Assessment'
      },

      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],

      header: function(currentPage, pageCount) {
        return {
          text: 'Innerval Values Assessment',
          alignment: 'center',
          margin: [0, 20, 0, 0],
          fontSize: 9,
          color: '#8a7575'
        };
      },

      footer: function(currentPage, pageCount) {
        return {
          columns: [
            { text: today, alignment: 'left', margin: [40, 0, 0, 0], fontSize: 8, color: '#8a7575' },
            { text: `Page ${currentPage} of ${pageCount}`, alignment: 'right', margin: [0, 0, 40, 0], fontSize: 8, color: '#8a7575' }
          ],
          margin: [0, 0, 0, 20]
        };
      },

      content: [
        {
          text: 'Your Values Profile',
          style: 'title',
          alignment: 'center',
          margin: [0, 0, 0, 8]
        },
        {
          text: 'Personal values ranked by importance',
          style: 'subtitle',
          alignment: 'center',
          margin: [0, 0, 0, 4]
        },
        {
          text: `${levelInfo.name} · ${totalValues} values`,
          style: 'badge',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        {
          table: {
            headerRows: 1,
            widths: [50, '*', 50],
            body: tableBody
          },
          layout: {
            hLineWidth: function(i) { return (i === 0 || i === 1) ? 0 : 0.5; },
            vLineWidth: function() { return 0; },
            hLineColor: function() { return '#e8ddd4'; },
            paddingLeft: function() { return 8; },
            paddingRight: function() { return 8; },
            paddingTop: function() { return 8; },
            paddingBottom: function() { return 8; }
          }
        }
      ],

      styles: {
        title: { fontSize: 24, bold: true, color: '#362b2b' },
        subtitle: { fontSize: 11, color: '#8a7575' },
        badge: { fontSize: 9, color: '#8a7575', bold: true },
        tableHeader: { fontSize: 10, bold: true, color: '#362b2b', fillColor: '#faf7f3', margin: [0, 4, 0, 4] },
        tierHeader: { fontSize: 9, bold: true, alignment: 'left', letterSpacing: 1.5 },
        rank: { fontSize: 10, color: '#8a7575' },
        valueName: { fontSize: 11, bold: true, color: '#362b2b', margin: [0, 0, 0, 2] },
        valueDesc: { fontSize: 9, color: '#8a7575', italics: true, margin: [0, 0, 0, 0] },
        score: { fontSize: 11, bold: true, color: '#c06b5e' }
      },

      defaultStyle: { font: 'Roboto' }
    };

    const filename = `innerval-results-${new Date().toISOString().slice(0, 10)}.pdf`;
    pdfMake.createPdf(docDefinition).download(filename);

  } catch (error) {
    console.error('PDF generation failed:', error);
    showModal({
      icon: 'error',
      title: 'PDF Error',
      message: 'Failed to generate PDF. Please try again.',
      buttons: [{ label: 'OK', cls: 'btn-primary' }]
    });
  }
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
