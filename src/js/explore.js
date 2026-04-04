// Explore values screen: browsing, filtering, aspirations, detail modal.

let activeCategory = 'All';
let currentExploreValue = null;
let exploreKeyboardListener = null;
let exploreTouchStartX = null;
let exploreTouchStartY = null;

// Professional SVG icons per category (replacing emojis)
var STAR_FILLED_SM = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
var STAR_EMPTY_SM = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

var CATEGORY_ICONS = {
  'Character': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  'Relationships': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  'Achievement': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  'Well-being': '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  'Purpose': '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  'Growth': '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>'
};

var CATEGORY_COLORS = {
  'Character': ['#c06b5e', 'rgba(192,107,94,.1)'],
  'Relationships': ['#9b7db8', 'rgba(155,125,184,.1)'],
  'Achievement': ['#d4a04a', 'rgba(212,160,74,.1)'],
  'Well-being': ['#5a9e6f', 'rgba(90,158,111,.1)'],
  'Purpose': ['#6b9ec0', 'rgba(107,158,192,.1)'],
  'Growth': ['#d49a90', 'rgba(212,154,144,.1)']
};

function getCategoryIcon(category, size) {
  size = size || 24;
  var path = CATEGORY_ICONS[category] || CATEGORY_ICONS['Character'];
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
}

function getCategoryColor(category) {
  return (CATEGORY_COLORS[category] || CATEGORY_COLORS['Character'])[0];
}

function getCategoryBg(category) {
  return (CATEGORY_COLORS[category] || CATEGORY_COLORS['Character'])[1];
}

function showExploreValues() {
  doShowExplore();
}

function doShowExplore() {
  hideAllScreens();
  document.getElementById('exploreValues').style.display = 'block';

  trackEvent('explore_opened');

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
      '<div class="explore-card-icon-wrap" style="color:' + getCategoryColor(d.category) + ';background:' + getCategoryBg(d.category) + '">' + getCategoryIcon(d.category) + '</div>' +
      '<div class="explore-card-name">' + name + '</div>' +
      '<div class="explore-card-desc">' + d.shortDesc + '</div>' +
      '<div class="explore-card-footer">' +
        '<span class="explore-card-category">' + d.category + '</span>' +
        '<button class="explore-card-aspire' + (isAsp ? ' active' : '') + '" onclick="event.stopPropagation();toggleAspiration(\'' + escaped + '\')" title="' + (isAsp ? 'Remove from aspirations' : 'Add to aspirations') + '">' + (isAsp ? STAR_FILLED_SM : STAR_EMPTY_SM) + '</button>' +
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
      (d ? getCategoryIcon(d.category, 14) + ' ' : '') + name +
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
      '<span class="my-value-icon" style="color:' + (d ? getCategoryColor(d.category) : 'var(--primary)') + '">' + (d ? getCategoryIcon(d.category, 16) : '') + '</span>' +
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
    icon: 'warning',
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
  currentExploreValue = name;
  renderExploreDetailContent(name);
  document.getElementById('exploreDetailOverlay').classList.add('visible');
  updateExploreNavButtons();
  attachExploreDetailListeners();
}

function renderExploreDetailContent(name) {
  const d = VALUE_EXPLORE_DATA[name];
  if (!d) return;
  const isAsp = aspirations.has(name);
  const escaped = escapeName(name);

  document.getElementById('exploreDetailContent').innerHTML =
    '<div class="detail-header">' +
      '<span class="detail-icon-wrap" style="color:' + getCategoryColor(d.category) + ';background:' + getCategoryBg(d.category) + '">' + getCategoryIcon(d.category, 28) + '</span>' +
      '<div><div class="detail-title">' + name + '</div><div class="detail-category">' + d.category + '</div></div>' +
    '</div>' +
    '<div class="detail-short">' + d.shortDesc + '</div>' +
    '<div class="detail-section"><h4>What It Means</h4><p>' + d.fullDesc + '</p></div>' +
    '<div class="detail-section"><h4>Examples of Living This Value</h4>' +
      '<ul class="detail-examples">' + d.examples.map(ex => '<li>' + ex + '</li>').join('') + '</ul>' +
    '</div>' +
    '<div class="detail-section"><h4>Why Cultivate This Value?</h4><div class="detail-why">' + d.whyCultivate + '</div></div>' +
    '<button class="detail-aspire-btn' + (isAsp ? ' active' : '') + '" onclick="toggleAspiration(\'' + escaped + '\')">' +
      (isAsp ? STAR_FILLED_SM + ' In My Aspirations' : STAR_EMPTY_SM + ' Add to My Aspirations') +
    '</button>';
}

function closeExploreDetail() {
  document.getElementById('exploreDetailOverlay').classList.remove('visible');
  detachExploreDetailListeners();
  currentExploreValue = null;
}

function navigateExploreDetail(direction) {
  const filtered = getFilteredValues();
  const currentIndex = filtered.indexOf(currentExploreValue);
  if (currentIndex === -1) return;

  let newIndex = currentIndex + direction;
  // Wrap around
  if (newIndex < 0) newIndex = filtered.length - 1;
  if (newIndex >= filtered.length) newIndex = 0;

  currentExploreValue = filtered[newIndex];
  renderExploreDetailContent(currentExploreValue);
  updateExploreNavButtons();
}

function updateExploreNavButtons() {
  const filtered = getFilteredValues();
  const prevBtn = document.getElementById('exploreNavPrev');
  const nextBtn = document.getElementById('exploreNavNext');

  // Hide navigation buttons if there's only one value
  if (filtered.length <= 1) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  } else {
    prevBtn.style.display = 'flex';
    nextBtn.style.display = 'flex';
  }
}

function attachExploreDetailListeners() {
  // Keyboard listener
  exploreKeyboardListener = function(e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      navigateExploreDetail(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      navigateExploreDetail(1);
    } else if (e.key === 'Escape') {
      closeExploreDetail();
    }
  };
  document.addEventListener('keydown', exploreKeyboardListener);

  // Touch/swipe listeners
  const modal = document.querySelector('.explore-detail');
  modal.addEventListener('touchstart', handleExploreTouchStart, { passive: true });
  modal.addEventListener('touchend', handleExploreTouchEnd, { passive: true });
}

function detachExploreDetailListeners() {
  if (exploreKeyboardListener) {
    document.removeEventListener('keydown', exploreKeyboardListener);
    exploreKeyboardListener = null;
  }

  const modal = document.querySelector('.explore-detail');
  modal.removeEventListener('touchstart', handleExploreTouchStart);
  modal.removeEventListener('touchend', handleExploreTouchEnd);
}

function handleExploreTouchStart(e) {
  exploreTouchStartX = e.touches[0].clientX;
  exploreTouchStartY = e.touches[0].clientY;
}

function handleExploreTouchEnd(e) {
  if (!exploreTouchStartX || !exploreTouchStartY) return;

  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;

  const deltaX = touchEndX - exploreTouchStartX;
  const deltaY = touchEndY - exploreTouchStartY;

  // Only trigger swipe if horizontal movement is dominant and exceeds threshold
  const threshold = 50;
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
    if (deltaX > 0) {
      // Swipe right - go to previous
      navigateExploreDetail(-1);
    } else {
      // Swipe left - go to next
      navigateExploreDetail(1);
    }
  }

  exploreTouchStartX = null;
  exploreTouchStartY = null;
}
