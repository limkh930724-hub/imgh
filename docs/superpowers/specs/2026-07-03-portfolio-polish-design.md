# Portfolio Landing Polish — Design Spec

**Date**: 2026-07-03
**File**: `index.html` (+ new `assets/thumbs/` directory, `sw.js` cache bump)

---

## Goal

이직용 포트폴리오 랜딩(`index.html`)의 설득력을 높이는 3가지 개선:

1. **케이스 스터디 노출** — `casestudy.html` 갤러리와 상세 페이지 5개가 현재 랜딩에서 전혀 링크되지 않음. 기획 역량(배경→고민과 결정→화면 설계→완성)이 가장 큰 차별화 포인트인데 묻혀 있음.
2. **프로젝트 카드 썸네일** — 카드가 이모지+텍스트뿐이라 결과물이 보이지 않음. 실제 앱 스크린샷으로 교체.
3. **레이아웃 균형 + 아이콘·태그 폴리싱** — 1440px 화면에서 콘텐츠 폭(960px)이 좁아 생기는 과도한 여백 완화, OS 이모지를 SVG 아이콘으로 통일, 스킬 태그에 위계 부여.

---

## A. 프로젝트 카드 개편

### 썸네일

- 6개 앱(공포탐욕지수, 커머스, 금융 도구 모음, 재난 대응, 운동 루틴, 포트폴리오 트래커)을 **라이트 테마, 1280×800 뷰포트**로 브라우저 캡처.
  - 포트폴리오 트래커는 비밀번호 게이트가 있으므로 게이트 통과 후 메인 화면을 캡처 (세션 내 수동 인증).
  - 금융 도구 모음은 대표 탭인 `?tab=backtest` 화면.
- webp 변환, 품질 ~80, **개당 40~80KB 목표**. 파일명: `assets/thumbs/thumb-<slug>.webp` (slug: `feargreed`, `commerce`, `finance`, `disaster`, `workout`, `pt`).
- 카드 구조 변경: 기존 상단 컬러 스트립 + 이모지 아이콘 제거 → 카드 최상단에 썸네일 영역.
  - `aspect-ratio: 16 / 10`, `object-fit: cover`, `object-position: top`, `loading="lazy"`, `alt` 는 프로젝트명.
  - 썸네일 하단에 기존 카드별 스트립 색상을 **2px 보더 라인**으로 유지 (카드 아이덴티티 보존).
  - 호버: 이미지 `scale(1.04)` transition (카드에 `overflow: hidden` 썸네일 래퍼). 기존 3D tilt 유지.
- 다크 테마에서도 라이트 캡처본을 그대로 사용 (일반적인 포트폴리오 프레이밍 관행). 썸네일 래퍼에 subtle 보더로 배경과 분리.

### 케이스 스터디 링크

- 카드 푸터: `Live ↗` 단일 링크 → `Live ↗ · 케이스 스터디 →` 2링크.
- 매핑:

| 카드 | Live | 케이스 스터디 |
|---|---|---|
| 공포탐욕지수 | `fear-greed.html` | `casestudy-feargreed.html` |
| 커머스 시스템 | `commerce.html` | `casestudy-commerce.html` |
| 금융 도구 모음 | `finance.html` | `casestudy-backtest.html` (대표) |
| 재난 대응 시뮬레이터 | `disaster.html` | `casestudy-disaster.html` |
| 운동 루틴 트래커 | `workout.html` | — (Live만) |
| 포트폴리오 트래커 | `portfolio_tracker.html` | — (Live만) |

- 섹션 부제("업무 외 시간에 직접 기획·설계·개발한…") 옆 또는 아래에 **"기획 케이스 스터디 전체 보기 →"** 링크 추가 → `casestudy.html`. `casestudy-asset.html` 등 카드에 직접 매핑되지 않은 케이스도 갤러리 경유로 도달 가능.

---

## B. 레이아웃 균형

- `.section__inner` `max-width: 960px` → **`1080px`**.
- 섹션 타이틀(`경력`, `기술 스택` 등) 폰트 크기 소폭 확대 (현재 대비 ~10%).
- 스크롤 스냅(`scroll-snap-type: y mandatory`), 섹션 수직 중앙 정렬, 모바일(≤768px) 동작은 **변경 없음**.
- 프로젝트 섹션(`section--free`)은 썸네일 추가로 자연스럽게 밀도 상승 — 별도 조치 없음.

---

## C. 아이콘·태그 폴리싱

### SVG 아이콘 교체

- 인라인 SVG, `stroke: currentColor`, `stroke-width: 1.5`, `fill: none`, 24×24 viewBox — Lucide 스타일 스트로크 아이콘으로 통일. 외부 라이브러리 없이 필요한 path만 인라인.
- 교체 대상:
  - **Hero 칩 4개**: 📍→ map-pin, 🏛️→ landmark/building, ☕→ coffee(Java), 🗺️→ map
  - **스킬 카드 헤더 6개**: BACKEND→ server, DATABASE→ database, GIS·MAP→ map, 보안·인증→ lock, 외부 연동→ link, 서버·INFRA→ terminal(또는 cpu)
  - **Contact 링크 3개**: ✉️→ mail, GitHub→ github mark, 🌐→ globe
- 프로젝트 카드 이모지는 A의 썸네일 교체로 함께 제거.
- 색상은 `currentColor` 기반이므로 테마 전환 자동 연동. 기존 이모지 배경 박스(스킬 카드) 스타일은 유지하되 내용물만 SVG로.

### 스킬 태그 위계

- `.tag--core` 클래스 신설: 그린 틴트 배경 + 그린 보더 (라이트: `#16a34a` 계열 저채도, 다크: `#4ade80` 계열 — 기존 테마 토큰 활용).
- 적용 대상 (카드당 1~2개): `Java 8`, `Spring MVC 3.2`, `eGovFramework 3.1`, `Oracle`, `SQL Tuning`, `OpenLayers`.

### 성능 배지 툴팁

- `#perfBadge`의 `title`을 "실시간 Core Web Vitals 점수"로 보강 (현재 "성능 모니터링").

---

## 구현 노트

- **Service Worker**: `index.html`이 PRECACHE에 포함되어 있으므로 `sw.js`의 `CACHE_NAME`을 `fg-cache-v8` → `fg-cache-v9`로 범프. 썸네일은 PRECACHE에 넣지 않음 (lazy 네트워크 로드로 충분).
- **썸네일 유지보수**: 앱 UI가 크게 바뀌면 해당 썸네일 재캡처 필요. 캡처 절차(뷰포트 1280×800, 라이트 테마, webp q80)를 CLAUDE.md에 한 줄 기록.
- **이미지 파일 위치**: 루트가 스크린샷으로 어지러우므로 서빙용 이미지는 `assets/thumbs/`에 격리. Vercel 정적 서빙은 하위 디렉토리 그대로 지원.

---

## 검증

- 데스크톱 1440×900, 노트북 1280×800, 모바일 390×844 각각 라이트/다크 스크린샷 확인.
- 체크 항목:
  - 썸네일 6개 모두 로드·비율 왜곡 없음, 호버 확대 동작.
  - 케이스 스터디 링크 4개 + 갤러리 링크 정상 이동.
  - 모바일에서 카드 푸터 2링크가 줄바꿈 없이(또는 의도된 줄바꿈으로) 정리됨.
  - 태그 위계·SVG 아이콘이 라이트/다크 모두에서 대비 확보.
  - 스크롤 스냅·리빌 애니메이션·3D tilt 기존 동작 유지.
