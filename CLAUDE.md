# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Innerval is a static, single-page web application for personal values discovery. Users take a quiz rating real-life scenarios on a 1-5 Likert scale across multiple values, then view ranked results, compare results with others, explore values, and generate AI growth plan prompts. There is no build system, bundler, or backend — it's vanilla HTML/CSS/JS served as static files.

## Architecture

**Single HTML entry point:** `index.html` contains all screens (landing, quiz, results, compare, explore, growth plan) as `<div>` sections toggled via `display:none/block`. Separate pages exist for `privacy.html` and `terms.html`.

**JavaScript modules** (loaded via `<script>` tags, no imports — all globals):
- `data/values-data.js` — `VALUES_DATA` array: each value has a name and 5 questions (one per area: Work, Relationships, Personal, Social, Leisure)
- `data/value-descriptions.js` — `VALUE_DESCRIPTIONS` object: short descriptions keyed by value name
- `data/value-explore-data.js` — `VALUE_EXPLORE_DATA` object: rich data (emoji, category, descriptions, examples) for the explore feature
- `js/state.js` — Global state (`currentIndex`, `answers`, `skippedSet`, `aspirations`) and localStorage persistence (`STORAGE_KEY`, `ASPIRATIONS_KEY`)
- `js/quiz.js` — Quiz rendering, answer saving, navigation between values, skip/summary panel
- `js/results.js` — Results display with tier rankings, PDF download (html2pdf), JSON export
- `js/navigation.js` — Screen switching (`hideAllScreens`), leave-quiz confirmation modal, header nav
- `js/compare.js` — File upload/drag-drop for comparing two JSON exports, radar chart, alignment calculation (Spearman's rho)
- `js/explore.js` — Browse/filter values by category, aspirations management, detail modal
- `js/growth-plan.js` — Generates a structured AI prompt based on results + aspirations
- `js/modal.js` — Generic modal dialog system
- `js/contact.js` — Contact form (mailto: link)
- `js/init.js` — App initialization: restore state from localStorage, bind global event listeners

**CSS** is split per component in `css/` (base, header, landing, quiz, results, compare, explore, growth-plan, modal, footer, legal).

## Key Patterns

- **Answer keys** use the format `{valueIndex}_{questionIndex}` (e.g., `"3_2"` = value 3, question 2)
- **State persistence** uses `localStorage` with keys `values_quiz_progress` and `innerval_aspirations`
- **Screen navigation** works by hiding all screens then showing one — there is no router
- **All functions are global** — no module system. Script load order in `index.html` matters (data files first, then state, then feature modules, init last)
- **Export format** is a versioned JSON with `{ version, exportedAt, totalValues, completedCount, values[] }` used for both export and comparison
