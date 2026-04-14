# Hub Page Redesign — Design Spec

**Date:** 2026-04-06

## Goal

Replace the current card-grid hub (`index.html`) with a split-layout portfolio page that has stronger personal branding impact.

## Layout

```
┌─ Nav (dark) ────────────────────────────────────────────────────┐
│  임광호 포트폴리오   홈  공포탐욕지수  복리 계산기  목표 자산    │
└─────────────────────────────────────────────────────────────────┘
┌─ Left (dark, 2fr) ──────┬─ Right (light, 3fr) ─────────────────┐
│  👨‍💻 avatar              │  🟢 라이브 서비스                      │
│  [PORTFOLIO badge]       │  ├ 📊 공포탐욕지수        [Live]      │
│  임광호                   │  ├ 💰 복리 계산기          [Live]      │
│  Developer · Investor    │  └ 🎯 목표 자산 계산기     [Live]      │
│  바이오 텍스트             │                                       │
│                          │  🔜 개발 예정                          │
│  [3개 라이브] [3개 예정]  │  ├ 💸 절세 계산기    [Coming Soon]    │
│  [직접 제작] [최신수정]   │  ├ 🏠 대출 이자 계산기               │
└──────────────────────────┴──┴ 📈 환율 손익 계산기 ──────────────┘
┌─ Footer (dark) ─────────────────────────────────────────────────┐
│  임광호 포트폴리오 · 직접 제작한 금융 분석 도구 모음    © 2025   │
└─────────────────────────────────────────────────────────────────┘
```

## Details

### Nav
- Background: `#0f0f14`
- Logo: "임광호 포트폴리오" white bold, `margin-right: auto`
- Links: 홈(active) / 공포탐욕지수 / 복리 계산기 / 목표 자산
- Height: 52px, sticky

### Left panel (dark, `#0f0f14`)
- Avatar: 52px circle, gradient `#6366f1 → #8b5cf6`, emoji 👨‍💻
- Badge: "PORTFOLIO" pill border `rgba(99,102,241,0.4)`, text `#818cf8`
- Name: "임광호", 2.2rem, weight 900, white
- Role: "Developer · Investor", small, muted
- Bio: "금융 데이터를 직접 분석하고 투자에 활용하는 개발자입니다."
- Stats grid (2×2):
  - 라이브 툴: 3개
  - 개발 예정: 3개
  - 직접 제작: 전 툴
  - 최신 수정: JS `document.lastModified`로 읽어 `"YYYY.MM"` 포맷으로 표시
- Purple radial gradient glow top-right (decorative)

### Right panel (light, `#f8f7f4`)
- Section label "🟢 라이브 서비스" (small uppercase)
- 3 live tool cards (white, green border):
  - 📊 공포탐욕지수 → `/fear-greed.html`
  - 💰 복리 계산기 → `/compound.html`
  - 🎯 목표 자산 계산기 → `/goal.html`
  - Each: icon + name + desc + `[Live]` green badge, hover shadow
- Section label "🔜 개발 예정"
- 3 coming soon rows (faded, non-clickable):
  - 💸 절세 계산기
  - 🏠 대출 이자 계산기
  - 📈 환율 손익 계산기

### Footer
- Background: `#0f0f14`
- Left: "임광호 포트폴리오 · 직접 제작한 금융 분석 도구 모음"
- Right: "© 2025"
- Text: `rgba(255,255,255,0.25)`

### Responsive
- ≤ 700px: split → single column (left on top, right below)
- ≤ 480px: nav links hidden except 홈

## "최신 수정" stat
```js
const d = new Date(document.lastModified);
const label = d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0');
document.getElementById('stat-modified').textContent = label;
```

## Files Changed
- `index.html` — full rewrite (only file)
