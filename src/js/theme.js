// Theme switching functionality

const THEME_STORAGE_KEY = 'innerval_theme';

function getTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (e) { /* ignore */ }

  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

function setTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) { /* ignore */ }

  updateThemeToggleIcon(theme);
}

function toggleTheme() {
  const current = getTheme();
  const newTheme = current === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

function updateThemeToggleIcon(theme) {
  const pills = [document.getElementById('themeTogglePill'), ...document.querySelectorAll('.theme-toggle-pill-mobile')];

  pills.forEach(function(pill) {
    if (!pill) return;

    const knob = pill.querySelector('.theme-knob svg');
    if (!knob) return;

    if (theme === 'dark') {
      // Show sun icon (to switch to light)
      knob.innerHTML = `
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      `;
      pill.setAttribute('aria-label', 'Switch to light mode');
    } else {
      // Show moon icon (to switch to dark)
      knob.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
      pill.setAttribute('aria-label', 'Switch to dark mode');
    }
  });
}

// Listen for system theme changes
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    // Only auto-switch if user hasn't explicitly set a preference
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (!saved) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    } catch (err) { /* ignore */ }
  });
}

// Add keyboard support for Enter/Space on pill toggle
document.addEventListener('DOMContentLoaded', function() {
  const pills = [document.getElementById('themeTogglePill'), ...document.querySelectorAll('.theme-toggle-pill-mobile')];

  pills.forEach(function(pill) {
    if (!pill) return;

    pill.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });
  });
});
