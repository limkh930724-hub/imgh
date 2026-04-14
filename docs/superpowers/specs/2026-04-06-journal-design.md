# Trading Journal (매매일지) — Design Spec

**Date:** 2026-04-06

## Goal

Build a standalone `journal.html` — a calendar-based stock trading journal where users can log buy/sell trades per day and view them in a monthly calendar view with entry details.

## Layout

```
┌─ Nav (dark) ─────────────────────────────────────────────────────┐
│  임광호 포트폴리오   홈  공포탐욕지수  복리 계산기  목표 자산     │
└──────────────────────────────────────────────────────────────────┘
┌─ Page (light background #f8f7f4) ────────────────────────────────┐
│  매매일지                                                         │
│  이번 달 거래를 기록하고 패턴을 파악하세요                         │
│                                                                   │
│  ┌── Stats bar ──────────────────────────────────────────────┐   │
│  │  전체 거래  |  이번달 매수  |  이번달 매도  |  종목 수     │   │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ◀ 2026년 4월  ▶                                                  │
│                                                                   │
│  ┌── Monthly Calendar ────────────────────────────────────────┐  │
│  │  월  화  수  목  금  토  일                                  │  │
│  │  [cells with colored dots for trades]                       │  │
│  └─────────────────────────────────────────────────────────── ┘  │
│                                                                   │
│  ┌── Day Panel (shown when day selected) ─────────────────────┐  │
│  │  2026년 4월 8일 거래 내역                                    │  │
│  │  [trade entries list]                                       │  │
│  │  + 거래 추가                                                 │  │
│  │  [add form: type/symbol/price/qty/memo]                     │  │
│  └─────────────────────────────────────────────────────────── ┘  │
└──────────────────────────────────────────────────────────────────┘
┌─ Footer (dark) ──────────────────────────────────────────────────┐
│  임광호 포트폴리오 · 직접 제작한 금융 분석 도구 모음    © 2025   │
└──────────────────────────────────────────────────────────────────┘
```

## Details

### Nav
- Same sticky dark nav as hub (`index.html`)
- Active link: none (journal is not currently in the nav links, hub logo still links to `/`)
- Links: 홈 / 공포탐욕지수 / 복리 계산기 / 목표 자산

### Page Header
- Title: "매매일지", large bold, dark
- Subtitle: "이번 달 거래를 기록하고 패턴을 파악하세요", muted

### Stats Bar
Four stat cards in a row (responsive: 2×2 on mobile):
- **전체 거래**: total number of entries across all time
- **이번달 매수**: count of buy entries in current calendar month
- **이번달 매도**: count of sell entries in current calendar month
- **종목 수**: distinct symbols traded this month

### Calendar

**Month navigation:**
- `◀` prev / `▶` next buttons flanking "YYYY년 M월" label
- Default: current month

**Grid:**
- Header row: 월 화 수 목 금 토 일 (Mon–Sun, or 일 월 화 수 목 금 토 Sun–Sat KR style)
  - Use Sun–Sat: 일 월 화 수 목 금 토
- Cells: 42 cells (6 rows × 7 cols), days outside the current month shown dim
- Each cell shows the day number (top-left) and colored dots:
  - Blue dot 🔵 if any buy trades that day
  - Red dot 🔴 if any sell trades that day
  - Purple dot 🟣 if both buy and sell trades on the same day
- Selected day cell: highlighted with a blue border/background

**Dot rendering:** small 8px circles below the day number, max 1 dot shown (merged color takes priority: both → purple, buy-only → blue, sell-only → red)

**Cell click:** selects that day, shows Day Panel below calendar

### Day Panel

Shown below the calendar when a day is selected.

**Header:** "YYYY년 M월 D일 거래 내역"

**Entry list:** each entry shows:
```
[매수|매도 badge]  종목명  가격  수량  (memo if present)  [🗑 delete]
```
- 매수 badge: blue background
- 매도 badge: red background
- Price formatted with commas (e.g. `82,500원`)
- Qty: `X주`
- Memo shown in muted text on a second line if present

**Empty state:** "이날 거래 내역이 없습니다" with a ＋ prompt

**Add Trade Form** (always shown below entries):
```
거래 추가
[매수 / 매도 toggle]
종목명: [text input, e.g. 삼성전자]
가격:   [number input, 원]
수량:   [number input, 주]
메모:   [text input, optional]
[추가하기 button]
```

- 매수/매도 toggle: two buttons, one active at a time, styled like a segmented control
- Required fields: 종목명, 가격, 수량 (validated before saving)
- 메모 is optional

### Data Structure

Persisted to `localStorage('fg-journal')`:

```json
{
  "2026-04-08": [
    {
      "id": "uuid-or-timestamp",
      "type": "buy",
      "symbol": "삼성전자",
      "price": 82500,
      "qty": 10,
      "memo": "분할 매수"
    }
  ]
}
```

- Key: `"YYYY-MM-DD"` string (local date, not UTC)
- `type`: `"buy"` or `"sell"`
- `id`: `Date.now() + Math.random()` (no external UUID library)

### Colors

- Background: `#f8f7f4` (light)
- Nav/footer: `#0f0f14` (dark)
- 매수 blue: `#3b82f6` / badge bg `#dbeafe`
- 매도 red: `#ef4444` / badge bg `#fee2e2`
- Both/purple: `#8b5cf6`
- Calendar today: subtle yellow highlight `rgba(251,191,36,0.15)`
- Calendar selected: `rgba(99,102,241,0.12)` border `#6366f1`

### Responsive
- ≤ 700px: stats bar 2×2 grid; calendar cells slightly smaller
- ≤ 480px: nav links hidden except logo

## Hub Integration

Add journal card to `index.html`:
- Move from "개발 예정" (coming soon) to "라이브 서비스" section
- Icon: 📓
- Name: "매매일지"
- Desc: "날짜별 매수·매도 기록, 캘린더로 한눈에 보는 거래 패턴"
- Tag: `[Live]`
- Link: `/journal.html`
- Update stats: 라이브 툴 3개 → 4개, 개발 예정 3개 → 2개

## Nav updates

Add "매매일지" link to nav in `index.html`, `compound.html`, `goal.html`, and `fear-greed.html`.
Also add nav to `journal.html` itself with "매매일지" as active link.

## Files Changed

- `journal.html` — new file (complete)
- `index.html` — promote journal card, update stats, add nav link
- `compound.html` — add nav link
- `goal.html` — add nav link
- `fear-greed.html` — add nav link
- `sw.js` — add `/journal.html` to PRECACHE, bump cache version
