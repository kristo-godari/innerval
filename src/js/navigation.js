// Screen management and navigation helpers.

function hideAllScreens() {
  ['landing', 'levelSelect', 'quiz', 'results', 'compareUpload', 'compareResults', 'exploreValues', 'growthPlan'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });
  document.getElementById('navLinks').classList.remove('open');
}

function isInQuiz() {
  return document.getElementById('quiz').style.display === 'block';
}

function isInAnyActiveScreen() {
  return document.getElementById('landing').style.display === 'none';
}

function updateLandingButtons() {
  // Landing buttons no longer change — the popup in startQuiz() handles in-progress state.
}

function navigateToLanding() {
  hideAllScreens();
  document.getElementById('landing').style.display = 'block';
  updateLandingButtons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goHome() {
  if (isInQuiz() || isInAnyActiveScreen()) {
    navigateToLanding();
    return;
  }
  document.getElementById('navLinks').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goSection(id) {
  function scrollToSection() {
    hideAllScreens();
    document.getElementById('landing').style.display = 'block';
    updateLandingButtons();
    setTimeout(function() {
      var el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  if (isInQuiz() || isInAnyActiveScreen()) {
    scrollToSection();
    return;
  }
  var el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
  document.getElementById('navLinks').classList.remove('open');
}

function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}
