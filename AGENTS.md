# Repository Guidelines

## Project Structure & Module Organization
This repository is a static multi-page web app. Root-level HTML files are the product:
`index.html` is the hub, `fear-greed.html` is the main dashboard, and `compound.html`, `goal.html`, `journal.html`, and `backtest.html` are standalone tools. Each page keeps its HTML, CSS, and JavaScript inline in one file.

Server-side logic lives in `api/proxy.js`, a small Vercel-style proxy for approved upstream APIs. Planning and design notes live under `docs/superpowers/specs/` and `docs/superpowers/plans/`. Ignore local tooling folders like `.claude/`, `.playwright-mcp/`, and `.superpowers/` unless you are intentionally working on agent workflow artifacts.

## Build, Test, and Development Commands
There is no build step or package manifest in this repo.

```bash
python -m http.server 8080
```

Serves the site locally at `http://localhost:8080`.

```bash
npx serve .
```

Alternative static server if Node is available.

## Coding Style & Naming Conventions
Match the existing style: 4-space indentation, inline `<style>` and `<script>` blocks, and small helper functions near their usage. Use `camelCase` for JavaScript variables and functions, and `kebab-case` for CSS classes. Keep pages self-contained unless a shared file is clearly justified.

Preserve the current bilingual UI patterns when editing visible text. For Yahoo Finance requests routed through `/api/proxy`, always wrap the full upstream URL with `encodeURIComponent(...)`.

## Testing Guidelines
No automated test suite is checked in today, so use manual smoke testing. After changes, run a local static server and verify the affected page in desktop and mobile widths. For API-backed features, confirm proxy requests succeed and that localStorage-backed features still reload correctly.

If you add a new page, verify navigation from `index.html` and update any service worker precache list if needed.

## Commit & Pull Request Guidelines
Recent history uses short Conventional Commit prefixes such as `feat:` and `fix:`, often with concise Korean descriptions. Keep that pattern, for example: `fix: backtest 카드 정렬 보정`.

Pull requests should include a short summary, affected pages, manual test notes, and screenshots or screen recordings for UI changes. Link the relevant spec or plan in `docs/superpowers/` when the work implements a documented feature.
