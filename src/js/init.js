// Application initialization: restore state, bind global event listeners.

(function initFromStorage() {
  const saved = loadProgress();
  if (!saved) return;

  // Restore quiz level
  quizLevel = saved.quizLevel || null;

  updateLandingButtons();

  // Restore answers
  Object.entries(saved.answers).forEach(([k, v]) => { answers[k] = v; });
  currentIndex = saved.currentIndex || 0;
  (saved.skipped || []).forEach(i => skippedSet.add(i));

  if (saved.screen === 'results') {
    // Default to full-spectrum for legacy saves without a level
    if (!quizLevel) quizLevel = 'full-spectrum';
    document.getElementById('landing').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    showResults();
  } else if (saved.screen === 'quiz') {
    if (!quizLevel) quizLevel = 'full-spectrum';
    document.getElementById('landing').style.display = 'none';
    document.getElementById('quiz').style.display = 'block';
    renderValue();
  }
})();

// Load aspirations on page load
loadAspirations();

// Header shadow on scroll
window.addEventListener('scroll', function() {
  document.getElementById('siteHeader').classList.toggle('scrolled', window.scrollY > 10);
});

// Intercept external page links during quiz
document.addEventListener('click', function(e) {
  if (!isInQuiz()) return;
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('blob:')) return;
  e.preventDefault();
  showLeaveModal(function() { window.location.href = href; });
});

// Close explore detail on overlay click
document.addEventListener('click', function(e) {
  const overlay = document.getElementById('exploreDetailOverlay');
  if (e.target === overlay) closeExploreDetail();
});

// Close explore detail on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const overlay = document.getElementById('exploreDetailOverlay');
    if (overlay.classList.contains('visible')) closeExploreDetail();
  }
});
