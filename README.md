# Innerval

Innerval is a free, static, single-page web application for personal values discovery. Take a quiz rating real-life scenarios across multiple values, view your ranked results, compare with others, explore values in depth, and generate AI-powered growth plan prompts.

No backend, no build system, no tracking — just vanilla HTML, CSS, and JavaScript.

## Features

- **Values Quiz** — Rate real-life scenarios on a 1-5 scale across five life areas (Work, Relationships, Personal, Social, Leisure)
- **Ranked Results** — View your values organized into tiers, download as PDF, or export as JSON
- **Compare** — Upload two JSON exports to compare results side-by-side with a radar chart and alignment score (Spearman's rho)
- **Explore Values** — Browse and filter values by category, read detailed descriptions, and mark aspirational values
- **Growth Plan** — Generate a structured AI prompt based on your results and aspirations
- **Progress Saving** — Quiz progress and aspirations are saved to localStorage automatically

## Getting Started

No installation or build step required. Simply serve the files with any static file server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

You can also open `index.html` directly in a browser.

## Project Structure

```
innerval/
├── index.html              # Main application (all screens)
├── privacy.html            # Privacy policy
├── terms.html              # Terms of service
├── css/                    # Stylesheets (one per component)
│   ├── base.css
│   ├── header.css
│   ├── landing.css
│   ├── quiz.css
│   ├── results.css
│   ├── compare.css
│   ├── explore.css
│   ├── growth-plan.css
│   ├── modal.css
│   ├── footer.css
│   └── legal.css
├── js/                     # Application logic (globals, no module system)
│   ├── state.js            # Global state and localStorage persistence
│   ├── quiz.js             # Quiz rendering and navigation
│   ├── results.js          # Results display, PDF/JSON export
│   ├── navigation.js       # Screen switching and header nav
│   ├── compare.js          # JSON comparison, radar chart, alignment
│   ├── explore.js          # Value browsing, filtering, aspirations
│   ├── growth-plan.js      # AI prompt generation
│   ├── modal.js            # Generic modal system
│   ├── contact.js          # Contact form
│   └── init.js             # App initialization
└── data/                   # Static data files
    ├── values-data.js      # Quiz questions per value
    ├── value-descriptions.js   # Short value descriptions
    └── value-explore-data.js   # Rich data for the explore feature
```

## Architecture

- **Single HTML entry point** — All screens are `<div>` sections in `index.html` toggled via `display:none/block`. No router.
- **No build system** — No bundler, transpiler, or package manager. All JavaScript is loaded via `<script>` tags.
- **All globals** — Script load order in `index.html` matters (data files first, then state, then feature modules, init last).
- **Client-side only** — All data stays in the browser. localStorage is used for persistence.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
