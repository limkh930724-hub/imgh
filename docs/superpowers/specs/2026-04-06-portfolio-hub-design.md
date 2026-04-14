# Portfolio Hub — Design Spec

**Date:** 2026-04-06

## Goal

Add a hub landing page (`index.html`) that presents "임광호 포트폴리오" as a collection of financial tools. The existing fear & greed app moves to `fear-greed.html`. Hub → tool navigation uses plain `<a href>` links (no SPA routing needed).

## File Changes

| File | Action |
|---|---|
| `index.html` | Rename → `fear-greed.html` (existing app, minimal edits) |
| `index.html` (new) | Hub page — nav + hero + 6-card grid |

## Hub Page (`index.html`)

### Top nav
- Left: logo text **임광호 포트폴리오**
- Right links: **홈** (active on hub), **공포탐욕지수** → `fear-greed.html`, **관심종목** (placeholder `#`)
- Sticky, white background, 1px bottom border

### Hero
- Small badge: "재테크 도구 모음"
- H1: "내 투자를 제대로 이해하는 금융 도구들"
- Subtitle: "직접 만든 금융 분석 툴과 계산기를 한 곳에서"

### Card Grid (3 × 2)

| # | Icon | Title | Description | Status | href |
|---|---|---|---|---|---|
| 1 | 📊 | 공포탐욕지수 | CNN Fear & Greed Index 실시간 추적, 히스토리 캘린더, 종목 수익률 계산기 | Live (green badge) | `fear-greed.html` |
| 2 | 💰 | 복리 계산기 | 원금·이율·기간으로 복리 수익을 시각화하고 단리와 비교 | Coming Soon | `#` |
| 3 | 💸 | 절세 계산기 | 주식·ETF 양도소득세 절세 전략 시뮬레이션 | Coming Soon | `#` |
| 4 | 🏠 | 대출 이자 계산기 | 원리금균등·원금균등 상환 방식 비교 및 총 이자 계산 | Coming Soon | `#` |
| 5 | 📈 | 환율 손익 계산기 | 달러·엔·유로 환전 시점별 손익과 환차손 시뮬레이션 | Coming Soon | `#` |
| 6 | 🎯 | 목표 자산 계산기 | 목표 금액까지 필요한 월 적립액과 기간을 역산 | Coming Soon | `#` |

Live card: green border (`#c8e6c9`), green badge. Coming Soon cards: default border, grey badge, pointer-events none (non-clickable).

### Visual Style
- Background: `#f8f7f4` (warm off-white)
- Cards: white, `border-radius: 14px`, hover lift + shadow
- Font: Inter (already loaded in fear-greed.html), fallback Segoe UI / Arial
- No dark mode on hub page (keep it simple)
- Responsive: 3-col → 2-col at ≤640px → 1-col at ≤400px

## fear-greed.html edits

Only two changes needed:
1. Add a **← 홈으로** back link in the top-left (small, above or inside the existing header area)
2. Update `<title>` to "공포탐욕지수 | 임광호 포트폴리오"

No other changes to the existing app logic.

## Out of Scope
- Dark mode for hub page
- Animations beyond hover lift
- Any backend / routing changes
