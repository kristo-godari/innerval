// Explore values screen: browsing, filtering, aspirations, detail modal.

let activeCategory = 'All';

function showExploreValues() {
  doShowExplore();
}

function doShowExplore() {
  hideAllScreens();
  document.getElementById('exploreValues').style.display = 'block';
  loadAspirations();
  renderExploreFilters();
  renderExploreGrid();
  renderMyValuesPanel();
  updateAspirationsUI();
  updatePlanCta();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Filtering ---

function renderExploreFilters() {
  const categories = ['All', 'Character', 'Relationships', 'Achievement', 'Well-being', 'Purpose', 'Growth'];
  document.getElementById('exploreFilters').innerHTML = categories.map(c =>
    '<button class="filter-chip' + (c === activeCategory ? ' active' : '') + '" onclick="setExploreCategory(\'' + c + '\')">' + c + '</button>'
  ).join('');
}

function setExploreCategory(cat) {
  activeCategory = cat;
  renderExploreFilters();
  renderExploreGrid();
}

function filterExploreValues() {
  renderExploreGrid();
}

function getFilteredValues() {
  const query = (document.getElementById('exploreSearch').value || '').toLowerCase().trim();
  return Object.keys(VALUE_EXPLORE_DATA).filter(name => {
    const data = VALUE_EXPLORE_DATA[name];
    if (activeCategory !== 'All' && data.category !== activeCategory) return false;
    if (query) {
      const searchable = (name + ' ' + data.shortDesc + ' ' + data.fullDesc + ' ' + data.category).toLowerCase();
      return searchable.indexOf(query) !== -1;
    }
    return true;
  });
}

// --- Grid Rendering ---

function renderExploreGrid() {
  const filtered = getFilteredValues();
  const grid = document.getElementById('exploreGrid');
  const empty = document.getElementById('exploreEmpty');

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = filtered.map(name => {
    const d = VALUE_EXPLORE_DATA[name];
    const isAsp = aspirations.has(name);
    const escaped = escapeName(name);
    return '<div class="explore-card' + (isAsp ? ' is-aspirated' : '') + '" onclick="openExploreDetail(\'' + escaped + '\')">' +
      '<div class="explore-card-emoji">' + d.emoji + '</div>' +
      '<div class="explore-card-name">' + name + '</div>' +
      '<div class="explore-card-desc">' + d.shortDesc + '</div>' +
      '<div class="explore-card-footer">' +
        '<span class="explore-card-category">' + d.category + '</span>' +
        '<button class="explore-card-aspire' + (isAsp ? ' active' : '') + '" onclick="event.stopPropagation();toggleAspiration(\'' + escaped + '\')" title="' + (isAsp ? 'Remove from aspirations' : 'Add to aspirations') + '">' + (isAsp ? '⭐' : '☆') + '</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function escapeName(name) {
  return name.replace(/'/g, "\\'");
}

// --- Aspirations ---

function toggleAspiration(name) {
  if (aspirations.has(name)) {
    aspirations.delete(name);
  } else {
    aspirations.add(name);
  }
  saveAspirations();
  renderExploreGrid();
  updateAspirationsUI();
  refreshDetailModalIfOpen(name);
}

function refreshDetailModalIfOpen(name) {
  const overlay = document.getElementById('exploreDetailOverlay');
  if (!overlay.classList.contains('visible')) return;
  const titleEl = overlay.querySelector('.detail-title');
  if (titleEl && titleEl.textContent === name) {
    renderExploreDetailContent(name);
  }
}

function updateAspirationsUI() {
  renderAspirationsPanel();
  updatePlanCta();
}

function renderAspirationsPanel() {
  const list = document.getElementById('aspirationsList');
  const empty = document.getElementById('aspirationsEmpty');
  const actions = document.getElementById('aspirationsPanelActions');

  if (aspirations.size === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    actions.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  actions.style.display = 'flex';

  list.innerHTML = [...aspirations].map(name => {
    const d = VALUE_EXPLORE_DATA[name];
    const escaped = escapeName(name);
    return '<span class="aspiration-tag" onclick="openExploreDetail(\'' + escaped + '\')">' +
      (d ? d.emoji + ' ' : '') + name +
      '<span class="remove-asp" onclick="event.stopPropagation();toggleAspiration(\'' + escaped + '\')" title="Remove">&times;</span>' +
    '</span>';
  }).join('');
}

function renderMyValuesPanel() {
  const results = getCompletedValues();
  const panel = document.getElementById('dashboardMyValues');
  const listEl = document.getElementById('myValuesList');
  const footerEl = document.getElementById('myValuesFooter');
  const dashboard = document.getElementById('exploreDashboard');

  if (results.length === 0) {
    panel.style.display = 'none';
    dashboard.classList.add('single-card');
    return;
  }

  panel.style.display = '';
  dashboard.classList.remove('single-card');
  const top = results.slice(0, 5);

  listEl.innerHTML = top.map((v, i) => {
    const d = VALUE_EXPLORE_DATA[v.name];
    const escaped = escapeName(v.name);
    return '<div class="my-value-item" onclick="openExploreDetail(\'' + escaped + '\')">' +
      '<span class="my-value-rank">#' + (i + 1) + '</span>' +
      '<span class="my-value-emoji">' + (d ? d.emoji : '') + '</span>' +
      '<span class="my-value-name">' + v.name + '</span>' +
      '<span class="my-value-score">' + v.avg.toFixed(1) + '</span>' +
    '</div>';
  }).join('');

  footerEl.innerHTML = results.length > 5
    ? '<span class="my-values-more">' + (results.length - 5) + ' more values assessed</span>'
    : '';
}

function updatePlanCta() {
  const hasResults = getCompletedValues().length > 0;
  const hasAspirations = aspirations.size > 0;
  const cta = document.getElementById('explorePlanCta');
  const desc = document.getElementById('planCtaDesc');

  if (!hasResults && !hasAspirations) {
    cta.style.display = 'none';
    return;
  }

  cta.style.display = 'flex';
  if (hasResults && hasAspirations) {
    desc.textContent = 'Based on your assessed values and aspirations';
  } else if (hasResults) {
    desc.textContent = 'Based on your assessed values';
  } else {
    desc.textContent = 'Based on your aspirations';
  }
}

function clearAllAspirations() {
  showModal({
    icon: '⭐',
    title: 'Clear All Aspirations?',
    message: 'This will remove all values from your aspirations list.',
    buttons: [
      { label: 'Cancel', cls: 'btn-secondary' },
      { label: 'Clear All', cls: 'btn-end', action: function() {
        aspirations.clear();
        saveAspirations();
        renderExploreGrid();
        updateAspirationsUI();
      }}
    ]
  });
}

// --- Detail Modal ---

function openExploreDetail(name) {
  renderExploreDetailContent(name);
  document.getElementById('exploreDetailOverlay').classList.add('visible');
}

function renderExploreDetailContent(name) {
  const d = VALUE_EXPLORE_DATA[name];
  if (!d) return;
  const isAsp = aspirations.has(name);
  const escaped = escapeName(name);

  document.getElementById('exploreDetailContent').innerHTML =
    '<div class="detail-header">' +
      '<span class="detail-emoji">' + d.emoji + '</span>' +
      '<div><div class="detail-title">' + name + '</div><div class="detail-category">' + d.category + '</div></div>' +
    '</div>' +
    '<div class="detail-short">' + d.shortDesc + '</div>' +
    '<div class="detail-section"><h4>What It Means</h4><p>' + d.fullDesc + '</p></div>' +
    '<div class="detail-section"><h4>Examples of Living This Value</h4>' +
      '<ul class="detail-examples">' + d.examples.map(ex => '<li>' + ex + '</li>').join('') + '</ul>' +
    '</div>' +
    '<div class="detail-section"><h4>Why Cultivate This Value?</h4><div class="detail-why">' + d.whyCultivate + '</div></div>' +
    '<button class="detail-aspire-btn' + (isAsp ? ' active' : '') + '" onclick="toggleAspiration(\'' + escaped + '\')">' +
      (isAsp ? '⭐ In My Aspirations' : '☆ Add to My Aspirations') +
    '</button>';
}

function closeExploreDetail() {
  document.getElementById('exploreDetailOverlay').classList.remove('visible');
}
