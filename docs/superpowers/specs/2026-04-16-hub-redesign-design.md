# Hub Redesign — Design Spec
Date: 2026-04-16

## Summary
Redesign `index.html` (포트폴리오 허브) from a green glassmorphism split-panel layout to a clean black-and-white agency-style design with light/dark toggle.

## Approved Design (Hybrid Evolution B)

### Color System
| Token | Light | Dark |
|---|---|---|
| `--bg` | `#ffffff` | `#09090b` |
| `--bg-2` | `#f4f4f5` | `#111113` |
| `--bg-card` | `#f2f2f2` | `#1c1c1c` |
| `--ink` | `#09090b` | `#fafafa` |
| `--ink-2` | `#52525b` | `#a1a1aa` |
| `--ink-3` | `#a1a1aa` | `#52525b` |
| `--border` | `rgba(0,0,0,0.07)` | `rgba(255,255,255,0.06)` |
| `--border-2` | `rgba(0,0,0,0.13)` | `rgba(255,255,255,0.12)` |

Green gradients and glassmorphism removed entirely. Accent color: `#8b5cf6` (purple) for italic headline only.

### Layout
Desktop: 2-column grid (`1fr 1.65fr`), `min-height: calc(100vh - nav - footer)`.  
Mobile (≤900px): single block column, `body { display: block }`.  
Mobile (≤600px): nav collapses to logo + active link + theme button only.

### Left Panel (hero-left)
- Badge: `PERSONAL DASHBOARD · SEOUL · HH:MM` with pulsing green dot
- Headline: "데이터를 읽고, / 도구를 만든다. / *Built for myself.*" (italic purple)
- Subtext: "숫자를 직접 만들고 관리합니다. / 투자와 일상을 연결하는 개인 도구 모음."
- CTA: GitHub ↗ (ghost button only — no tool shortcut link)
- Stats row: `6개 LIVE TOOLS · 전툴 HAND CRAFTED · Seoul BASED`

### Right Panel (hero-right)
**Tech strip** (pill tags, border-only style):
`Vanilla JS · Chart.js · Canvas API · Vercel · Yahoo Finance API · CSS Grid · PWA`

**Card list** — uniform spotlight cards:
- All 6 tools in equal-height rows
- Each card: icon box + tool name + 1-line description + Live badge + → arrow
- On hover: gradient border (indigo→violet→pink) + radial spotlight glow (mouse-tracked via CSS vars)
- Click: navigate directly to tool page (no expand/accordion)
- Description truncated to 1 line (`-webkit-line-clamp: 1`)

Tools: 공포탐욕지수, 자산 계산기, 백테스트 비교기, 운동 루틴, AI 에이전트, 커머스 시스템

**Coming Soon list**: 세금 계산기, 대출 이자 계산기

### Theme Toggle
- Button in nav top-right: ☾ / ☀
- `data-theme` attribute on `<html>`
- Persisted to `localStorage('hub-theme')`
- Default: dark

### JS retained
- `updateHeroClock()` — updates badge time + hero-now every 30s
- Spotlight mouse tracking per card (`--mx`, `--my` CSS vars)
- Theme toggle with localStorage persistence
- `document.lastModified` removed (stat is hardcoded "6개")
- Pointer-move page glow effect removed (replaced by per-card spotlight)
