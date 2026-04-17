# UI Lab Design Spec

## Overview

`ui-lab.html` — 포트폴리오용 UI 쇼케이스 페이지. React + Tailwind CDN, parallax.js 히어로, 4가지 테마 전환(Dark/Glass/Neon/Minimal), 7개 컴포넌트 섹션.

## Tech Stack

- React 18 (CDN) + Babel Standalone — 쇼케이스 섹션 JSX
- Tailwind CSS (CDN) — 레이아웃/스페이싱/타이포그래피 유틸리티
- parallax.js 3.1.0 (CDN) — 히어로 마우스 깊이감 효과
- Vanilla JS — TopNav, 페이지 전환 오버레이 (기존 패턴 동일)

## Page Structure

```
TopNav (기존 패턴)
Hero (Vanilla HTML + parallax.js, React 밖)
  └─ Layer 0 (depth 0.05): 방사형 그라디언트 배경
  └─ Layer 1 (depth 0.20): 4가지 테마 미니 카드 (Dark/Glass/Neon/Minimal)
  └─ Layer 2 (depth 0.45): 기하학 장식 도형 (원, 선)
  └─ Layer 3 (depth 0.80): "UI Lab" 타이틀 + 부제 + 스크롤 힌트
React Root (#root)
  └─ ThemeSwitcher: [Dark | Glass | Neon | Minimal] 버튼 바
  └─ Showcase wrapper (data-theme 적용)
      ├─ ButtonsSection
      ├─ CardsSection
      ├─ BadgesSection
      ├─ FormSection
      ├─ ModalSection
      ├─ TableSection
      └─ AnimationSection
Footer
Page transition script (기존 패턴)
```

## Theme Definitions

| 테마 | --bg | --surface | --border | --accent |
|---|---|---|---|---|
| dark | #09090b | #18181b | rgba(255,255,255,0.08) | #8b5cf6 |
| glass | gradient(#0f172a→#1e1b4b) | rgba(255,255,255,0.08) | rgba(255,255,255,0.18) | #38bdf8 |
| neon | #020617 | #0a0a1a | #22d3ee | #22d3ee / #f0abfc |
| minimal | #f9fafb | #ffffff | #e5e7eb | #374151 |

Glass 테마는 backdrop-filter: blur(12px) 적용.
Neon 테마는 카드/버튼에 box-shadow neon glow 적용.

## React State

- `theme` (App): `'dark' | 'glass' | 'neon' | 'minimal'` — 쇼케이스 전체에 data-theme 전달
- `modalOpen` (ModalSection local): boolean
- `sortCol`, `sortDir` (TableSection local): 정렬 상태
- `progress` (AnimationSection local): 0–100 숫자, setInterval로 자동 증가

## Component Specs

### ButtonsSection
Primary, Secondary, Outline, Ghost, Destructive 5종.
각 테마별 색상 자동 적용. 호버/active 상태 포함.

### CardsSection
기본 카드(제목+본문+버튼), 통계 카드(숫자+레이블+변화율), 프로필 카드(아바타+이름+태그) 3종.

### BadgesSection
Success / Warning / Error / Info / Neutral / New 6종 뱃지.

### FormSection
텍스트 인풋, 패스워드 인풋 (표시/숨기기 토글), 셀렉트, 체크박스 2개, 제출 버튼.
실제 동작하는 controlled input.

### ModalSection
"모달 열기" 버튼 → 오버레이 + 모달 다이얼로그. 확인/취소 버튼으로 닫기.
ESC 키로도 닫기.

### TableSection
5열(이름, 역할, 상태, 가입일, 액션) × 5행 샘플 데이터.
열 헤더 클릭으로 오름차순/내림차순 정렬.

### AnimationSection
- 스피너: 3종 (ring, dots, pulse)
- 스켈레톤: 카드 형태 shimmer 애니메이션
- 진행바: 0→100% 자동 루프 (3초 주기)

## Integration

- `index.html`: 🧪 "UI Lab" 카드 추가 (card-list 2열 그리드)
- `sw.js`: PRECACHE에 `/ui-lab.html` 추가, CACHE_NAME → `fg-cache-v9`
