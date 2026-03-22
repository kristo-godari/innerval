// Comparison feature: file upload, drag-drop, rendering all comparison views.

let compareData1 = null;
let compareData2 = null;
let compareFromResultsMode = false;

// --- Upload & File Handling ---

function showCompareUpload() {
  if (isInQuiz()) {
    showLeaveModal(function() {
      doShowCompareUpload();
    });
    return;
  }
  doShowCompareUpload();
}

function doShowCompareUpload() {
  hideAllScreens();
  document.getElementById('compareUpload').style.display = 'block';
  compareFromResultsMode = false;
  resetCompareUpload();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function compareFromResults() {
  const currentUserData = buildCurrentUserExport();
  if (!currentUserData) {
    showModal({
      icon: '⚠️',
      title: 'No Results',
      message: 'Please complete at least one value before comparing.',
      buttons: [{ label: 'Got it', cls: 'btn-primary' }]
    });
    return;
  }
  hideAllScreens();
  document.getElementById('compareUpload').style.display = 'block';
  compareFromResultsMode = true;
  resetCompareUpload();

  // Pre-fill Person A with current results
  compareData1 = currentUserData;
  const dz1 = document.getElementById('dropzone1');
  dz1.classList.add('loaded');
  document.getElementById('dropFile1').style.display = 'block';
  var levelLabel = currentUserData.quizLevel && QUIZ_LEVELS[currentUserData.quizLevel] ? ' · ' + QUIZ_LEVELS[currentUserData.quizLevel].name : '';
  document.getElementById('dropFile1').textContent = '✓ Your current results (' + currentUserData.completedCount + ' values' + levelLabel + ')';
  dz1.querySelector('.dropzone-hint').style.display = 'none';
  dz1.querySelector('.btn').style.display = 'none';
  updateCompareBtn();
}

function buildCurrentUserExport() {
  const completedValues = getActiveDetailedCompletedValues();
  if (completedValues.length === 0) return null;
  return buildExportData(completedValues);
}

function resetCompareUpload() {
  compareData1 = null;
  compareData2 = null;
  [1, 2].forEach(n => {
    const dz = document.getElementById('dropzone' + n);
    dz.classList.remove('loaded', 'dragover');
    document.getElementById('dropFile' + n).style.display = 'none';
    document.getElementById('dropFile' + n).textContent = '';
    dz.querySelector('.dropzone-hint').style.display = '';
    dz.querySelector('.btn').style.display = '';
    document.getElementById('fileInput' + n).value = '';
  });
  updateCompareBtn();
}

function cancelCompare() {
  hideAllScreens();
  if (compareFromResultsMode) {
    document.getElementById('results').style.display = 'block';
  } else {
    document.getElementById('landing').style.display = 'block';
    updateLandingButtons();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToCompareUpload() {
  hideAllScreens();
  document.getElementById('compareUpload').style.display = 'block';
  resetCompareUpload();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('dragover');
}

function handleDrop(e, num) {
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) processFile(file, num);
}

function handleFileSelect(e, num) {
  const file = e.target.files[0];
  if (file) processFile(file, num);
}

function processFile(file, num) {
  if (!file.name.endsWith('.json')) {
    showModal({
      icon: '⚠️',
      title: 'Invalid File',
      message: 'Please upload a .json file exported from Innerval.',
      buttons: [{ label: 'Got it', cls: 'btn-primary' }]
    });
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!validateExport(data)) {
        showModal({
          icon: '⚠️',
          title: 'Invalid Format',
          message: 'This file doesn\'t appear to be a valid Innerval export. Make sure to use the "Export Data" button to generate it.',
          buttons: [{ label: 'Got it', cls: 'btn-primary' }]
        });
        return;
      }
      if (num === 1) compareData1 = data;
      else compareData2 = data;

      const dz = document.getElementById('dropzone' + num);
      dz.classList.add('loaded');
      const fileEl = document.getElementById('dropFile' + num);
      fileEl.style.display = 'block';
      var levelLabel = data.quizLevel && QUIZ_LEVELS[data.quizLevel] ? ' · ' + QUIZ_LEVELS[data.quizLevel].name : '';
      fileEl.textContent = '✓ ' + file.name + ' (' + data.completedCount + ' values' + levelLabel + ')';
      dz.querySelector('.dropzone-hint').style.display = 'none';
      dz.querySelector('.btn').style.display = 'none';
      updateCompareBtn();
    } catch (err) {
      showModal({
        icon: '❌',
        title: 'Parse Error',
        message: 'Could not read this file. Please make sure it\'s a valid JSON export.',
        buttons: [{ label: 'Got it', cls: 'btn-primary' }]
      });
    }
  };
  reader.readAsText(file);
}

function validateExport(data) {
  return data && typeof data === 'object' && Array.isArray(data.values) &&
    data.values.length > 0 && data.values[0].name && typeof data.values[0].average === 'number';
}

function updateCompareBtn() {
  document.getElementById('compareBtn').disabled = !(compareData1 && compareData2);
}

// --- Comparison Logic ---

function runComparison() {
  if (!compareData1 || !compareData2) return;
  hideAllScreens();
  document.getElementById('compareResults').style.display = 'block';
  renderComparison(compareData1, compareData2);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderComparison(dataA, dataB) {
  const nameA = 'Person A';
  const nameB = 'Person B';
  document.getElementById('compareSubtitle').textContent = nameA + ' vs ' + nameB;
  document.getElementById('legendA').textContent = nameA;
  document.getElementById('legendB').textContent = nameB;
  document.getElementById('tierColA').textContent = nameA;
  document.getElementById('tierColB').textContent = nameB;

  const mapA = {};
  dataA.values.forEach(v => { mapA[v.name] = v; });
  const mapB = {};
  dataB.values.forEach(v => { mapB[v.name] = v; });

  const commonNames = dataA.values.filter(v => mapB[v.name]).map(v => v.name);
  const onlyA = dataA.values.filter(v => !mapB[v.name]).map(v => v.name);
  const onlyB = dataB.values.filter(v => !mapA[v.name]).map(v => v.name);

  const alignment = calculateAlignment(dataA.values, dataB.values, commonNames);

  renderAlignmentRing(alignment);
  renderSummaryStats(commonNames, onlyA, onlyB, dataA, dataB, alignment);
  renderRadarChart(dataA.values, dataB.values, mapA, mapB);
  renderSideBySide(dataA.values, dataB.values, nameA, nameB);

  const diffs = commonNames.map(name => ({
    name,
    avgA: mapA[name].average,
    avgB: mapB[name].average,
    diff: Math.abs(mapA[name].average - mapB[name].average)
  }));
  diffs.sort((a, b) => a.diff - b.diff);

  renderSimilarities(diffs.slice(0, 5), nameA, nameB);
  renderDifferences([...diffs].sort((a, b) => b.diff - a.diff).slice(0, 5), nameA, nameB);
  renderTierTable(dataA.values, dataB.values, mapA, mapB, commonNames);
  renderCategoryBreakdown(dataA.values, dataB.values, nameA, nameB);
}

// --- Alignment Calculation ---

function calculateAlignment(valsA, valsB, commonNames) {
  if (commonNames.length < 2) return 0;
  const mapA = {};
  const mapB = {};
  valsA.forEach(v => { mapA[v.name] = v.average; });
  valsB.forEach(v => { mapB[v.name] = v.average; });

  // Re-rank common values by each person's averages (handles cross-level comparisons)
  const sortedByA = [...commonNames].sort((a, b) => mapA[b] - mapA[a]);
  const sortedByB = [...commonNames].sort((a, b) => mapB[b] - mapB[a]);

  const rankA = {};
  const rankB = {};
  sortedByA.forEach((name, i) => { rankA[name] = i + 1; });
  sortedByB.forEach((name, i) => { rankB[name] = i + 1; });

  const n = commonNames.length;
  let dSquaredSum = 0;
  commonNames.forEach(name => {
    const d = rankA[name] - rankB[name];
    dSquaredSum += d * d;
  });
  const rho = 1 - (6 * dSquaredSum) / (n * (n * n - 1));
  return Math.max(0, Math.round(((rho + 1) / 2) * 100));
}

// --- Rendering Helpers ---

function renderAlignmentRing(pct) {
  const arc = document.getElementById('alignmentArc');
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference;
  setTimeout(() => {
    arc.style.transition = 'stroke-dashoffset 1.5s ease';
    arc.style.strokeDashoffset = offset;
  }, 100);
  document.getElementById('alignmentValue').textContent = pct + '%';

  let desc;
  if (pct >= 80) desc = 'Very high alignment — you share remarkably similar value priorities!';
  else if (pct >= 60) desc = 'Strong alignment — many of your core values overlap.';
  else if (pct >= 40) desc = 'Moderate alignment — you share some priorities but differ in others.';
  else if (pct >= 20) desc = 'Low alignment — your value priorities are quite different.';
  else desc = 'Very different priorities — you approach life from contrasting value frameworks.';
  document.getElementById('alignmentDesc').textContent = desc;
}

function getLevelDisplayName(data) {
  if (data.quizLevel && QUIZ_LEVELS[data.quizLevel]) return QUIZ_LEVELS[data.quizLevel].name;
  return 'Full Spectrum';
}

function renderSummaryStats(common, onlyA, onlyB, dataA, dataB, alignment) {
  const levelA = getLevelDisplayName(dataA);
  const levelB = getLevelDisplayName(dataB);
  let levelNote = '';
  if (levelA !== levelB) {
    levelNote = `<div class="compare-level-note">Note: Person A took the <strong>${levelA}</strong> assessment and Person B took <strong>${levelB}</strong>. Only shared values are compared.</div>`;
  }

  document.getElementById('compareStats').innerHTML = `
    <div class="cstat-card"><div class="cstat-num">${common.length}</div><div class="cstat-label">Shared Values</div></div>
    <div class="cstat-card"><div class="cstat-num">${dataA.completedCount}</div><div class="cstat-label">Person A Values<br><small>${levelA}</small></div></div>
    <div class="cstat-card"><div class="cstat-num">${dataB.completedCount}</div><div class="cstat-label">Person B Values<br><small>${levelB}</small></div></div>
    <div class="cstat-card"><div class="cstat-num">${alignment}%</div><div class="cstat-label">Rank Alignment</div></div>
  ` + levelNote;
}

function renderRadarChart(valsA, valsB, mapA, mapB) {
  const topANames = valsA.slice(0, 10).map(v => v.name);
  const topBNames = valsB.slice(0, 10).map(v => v.name);
  const labels = [...new Set([...topANames, ...topBNames])].slice(0, 12);
  const n = labels.length;
  if (n < 3) {
    document.getElementById('radarChart').innerHTML = '<text x="250" y="250" text-anchor="middle" fill="var(--muted)" font-size="14">At least 3 completed values are needed for a radar chart.</text>';
    return;
  }

  const cx = 250, cy = 250, maxR = 180;
  const angleStep = (2 * Math.PI) / n;
  let svg = '';

  // Grid rings
  for (let ring = 1; ring <= 5; ring++) {
    const r = (ring / 5) * maxR;
    let points = '';
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      points += `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)} `;
    }
    svg += `<polygon points="${points}" fill="none" stroke="var(--border)" stroke-width="1" opacity="${ring === 5 ? 0.6 : 0.3}"/>`;
  }

  // Axis lines + labels
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const x2 = cx + maxR * Math.cos(angle);
    const y2 = cy + maxR * Math.sin(angle);
    svg += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="var(--border)" stroke-width="0.5"/>`;
    const lx = cx + (maxR + 24) * Math.cos(angle);
    const ly = cy + (maxR + 24) * Math.sin(angle);
    const anchor = Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : (Math.cos(angle) > 0 ? 'start' : 'end');
    svg += `<text x="${lx}" y="${ly}" text-anchor="${anchor}" dominant-baseline="central" font-size="11" fill="var(--muted)" font-weight="600">${labels[i]}</text>`;
  }

  function makePolygon(map, color, opacityFill) {
    let points = '';
    for (let i = 0; i < n; i++) {
      const val = map[labels[i]] ? map[labels[i]].average : 0;
      const r = (val / 5) * maxR;
      const angle = i * angleStep - Math.PI / 2;
      points += `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)} `;
    }
    return `<polygon points="${points}" fill="${color}" fill-opacity="${opacityFill}" stroke="${color}" stroke-width="2.5"/>`;
  }

  function makePoints(map, color) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const val = map[labels[i]] ? map[labels[i]].average : 0;
      const r = (val / 5) * maxR;
      const angle = i * angleStep - Math.PI / 2;
      s += `<circle cx="${cx + r * Math.cos(angle)}" cy="${cy + r * Math.sin(angle)}" r="4" fill="${color}" stroke="white" stroke-width="1.5"/>`;
    }
    return s;
  }

  svg += makePolygon(mapA, '#c06b5e', 0.15);
  svg += makePolygon(mapB, '#9b7db8', 0.15);
  svg += makePoints(mapA, '#c06b5e');
  svg += makePoints(mapB, '#9b7db8');

  document.getElementById('radarChart').innerHTML = svg;
}

function renderSideBySide(valsA, valsB, nameA, nameB) {
  const topA = valsA.slice(0, 5);
  const topB = valsB.slice(0, 5);

  function renderColumn(values, name, cls) {
    return `
      <div class="sbs-col">
        <div class="sbs-header ${cls}">${name}</div>
        ${values.map((v, i) => `
          <div class="sbs-item">
            <span class="sbs-rank">#${i + 1}</span>
            <span class="sbs-name">${v.name}</span>
            <span class="sbs-score">${v.average.toFixed(1)}</span>
          </div>
        `).join('')}
      </div>`;
  }

  document.getElementById('sideBySide').innerHTML =
    renderColumn(topA, nameA, 'sbs-a') + renderColumn(topB, nameB, 'sbs-b');
}

function renderDiffRows(items, nameA, nameB) {
  return items.map(item => {
    const pctA = (item.avgA / 5) * 100;
    const pctB = (item.avgB / 5) * 100;
    const badgeClass = item.diff < 0.5 ? 'similar' : 'different';
    return `
      <div class="diff-row">
        <div class="diff-name">${item.name}</div>
        <div class="diff-bars">
          <div class="diff-bar-row">
            <span class="diff-label">${nameA}</span>
            <div class="diff-bar-track"><div class="diff-bar bar-a" style="width:${pctA}%"></div></div>
            <span class="diff-val">${item.avgA.toFixed(1)}</span>
          </div>
          <div class="diff-bar-row">
            <span class="diff-label">${nameB}</span>
            <div class="diff-bar-track"><div class="diff-bar bar-b" style="width:${pctB}%"></div></div>
            <span class="diff-val">${item.avgB.toFixed(1)}</span>
          </div>
        </div>
        <div class="diff-badge ${badgeClass}">Δ ${item.diff.toFixed(1)}</div>
      </div>`;
  }).join('');
}

function renderSimilarities(items, nameA, nameB) {
  const el = document.getElementById('similarities');
  el.innerHTML = items.length === 0
    ? '<p class="no-data">No shared values to compare.</p>'
    : renderDiffRows(items, nameA, nameB);
}

function renderDifferences(items, nameA, nameB) {
  const el = document.getElementById('differences');
  el.innerHTML = items.length === 0
    ? '<p class="no-data">No shared values to compare.</p>'
    : renderDiffRows(items, nameA, nameB);
}

// --- Tier Helpers ---

function getTier(rank, total) {
  const pct = rank / total;
  if (pct <= 0.16) return '🏆 Core';
  if (pct <= 0.32) return '⭐ Very Important';
  if (pct <= 0.56) return '✅ Important';
  if (pct <= 0.80) return '➖ Moderate';
  return '📉 Less Important';
}

function getTierClass(rank, total) {
  const pct = rank / total;
  if (pct <= 0.16) return 'tier-core';
  if (pct <= 0.32) return 'tier-very';
  if (pct <= 0.56) return 'tier-important';
  if (pct <= 0.80) return 'tier-moderate';
  return 'tier-less';
}

function renderTierTable(valsA, valsB, mapA, mapB, commonNames) {
  const totalA = valsA.length;
  const totalB = valsB.length;
  const rows = commonNames.map(name => {
    const a = mapA[name];
    const b = mapB[name];
    return {
      name,
      rankA: a.rank, rankB: b.rank,
      avgA: a.average, avgB: b.average,
      tierA: getTier(a.rank, totalA),
      tierB: getTier(b.rank, totalB),
      tierClassA: getTierClass(a.rank, totalA),
      tierClassB: getTierClass(b.rank, totalB),
      diff: Math.abs(a.average - b.average)
    };
  });
  rows.sort((a, b) => b.diff - a.diff);

  document.getElementById('tierTableBody').innerHTML = rows.map(r => {
    const diffClass = r.diff < 0.5 ? 'diff-low' : r.diff < 1.5 ? 'diff-mid' : 'diff-high';
    return `
      <tr>
        <td class="tier-name">${r.name}</td>
        <td><span class="tier-badge ${r.tierClassA}">${r.tierA}</span><br><span class="tier-score">${r.avgA.toFixed(1)} (#${r.rankA})</span></td>
        <td><span class="tier-badge ${r.tierClassB}">${r.tierB}</span><br><span class="tier-score">${r.avgB.toFixed(1)} (#${r.rankB})</span></td>
        <td><span class="diff-indicator ${diffClass}">${r.diff.toFixed(1)}</span></td>
      </tr>`;
  }).join('');
}

function renderCategoryBreakdown(valsA, valsB, nameA, nameB) {
  const areas = ['Work', 'Relationships', 'Personal', 'Social', 'Leisure'];
  const icons = { Work: '💼', Relationships: '❤️', Personal: '🌱', Social: '🤝', Leisure: '🎯' };

  function areaAverages(vals) {
    const areaMap = {};
    areas.forEach(a => { areaMap[a] = { sum: 0, count: 0 }; });
    vals.forEach(v => {
      if (v.questions) {
        v.questions.forEach(q => {
          if (areaMap[q.area]) {
            areaMap[q.area].sum += q.score;
            areaMap[q.area].count++;
          }
        });
      }
    });
    const result = {};
    areas.forEach(a => {
      result[a] = areaMap[a].count > 0 ? areaMap[a].sum / areaMap[a].count : 0;
    });
    return result;
  }

  const avgA = areaAverages(valsA);
  const avgB = areaAverages(valsB);

  document.getElementById('categoryBreakdown').innerHTML = '<div class="cat-grid">' +
    areas.map(area => {
      const pctA = (avgA[area] / 5) * 100;
      const pctB = (avgB[area] / 5) * 100;
      return `
        <div class="cat-card">
          <div class="cat-icon">${icons[area] || '📊'}</div>
          <div class="cat-name">${area}</div>
          <div class="cat-bars">
            <div class="cat-bar-row">
              <span class="cat-label">${nameA}</span>
              <div class="cat-bar-track"><div class="cat-bar bar-a" style="width:${pctA}%"></div></div>
              <span class="cat-val">${avgA[area].toFixed(1)}</span>
            </div>
            <div class="cat-bar-row">
              <span class="cat-label">${nameB}</span>
              <div class="cat-bar-track"><div class="cat-bar bar-b" style="width:${pctB}%"></div></div>
              <span class="cat-val">${avgB[area].toFixed(1)}</span>
            </div>
          </div>
        </div>`;
    }).join('') + '</div>';
}

function downloadComparisonPDF() {
  const element = document.getElementById('compareResults');
  const opt = {
    margin: [10, 10, 10, 10],
    filename: 'innerval-comparison.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };
  html2pdf().set(opt).from(element).save();
}
