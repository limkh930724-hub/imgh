# 재난 대응 시뮬레이션 UI — Design Spec
Date: 2026-04-22

## Summary

정적 HTML 포트폴리오 레포에 `disaster.html` 페이지를 추가한다. 백엔드/DB 없이 JavaScript 가상 데이터만으로 재난 대응 시뮬레이션 UI를 구현한다. Leaflet.js 기반 풀스크린 지도 + 재난 관제센터 스타일 UI로 포트폴리오 임팩트를 극대화한다.

## Decisions

| 항목 | 결정 |
|---|---|
| 파일 위치 | `disaster.html` (레포 루트, 기존 페이지들과 동일) |
| 지도 라이브러리 | Leaflet.js CDN + OpenStreetMap 타일 |
| 데이터 소스 | JS 하드코딩 가상 데이터 (서울 실제 좌표 기반) |
| 레이아웃 | 풀스크린 지도 + 플로팅 컨트롤 + 우측 슬라이드 패널 |
| 테마 | 재난 관제센터 스타일 (짙은 네이비/슬레이트 + 빨강/주황 강조) |
| 다크/라이트 토글 | 없음 (단일 다크 테마) |
| 포트폴리오 연동 | `index.html` 카드 추가 |

## Color System

```css
--bg:          #0a0f1e   /* 짙은 네이비 배경 */
--surface:     #0d1b2a   /* 헤더/패널 */
--surface-2:   #112240   /* 카드 배경 */
--border:      #1e3a5f   /* 구분선 */
--accent:      #ef4444   /* 빨강 강조 */
--accent-2:    #f97316   /* 주황 보조 */
--text:        #e2e8f0   /* 본문 */
--text-2:      #94a3b8   /* 보조 텍스트 */
--shelter:     #22d3ee   /* 대피소 마커 (청록) */
--recommend:   #a855f7   /* 추천 TOP3 마커 (보라) */

/* 위험지역 레벨별 */
--risk-3:      #ef4444   /* 위험 */
--risk-2:      #f97316   /* 경계 */
--risk-1:      #eab308   /* 주의 */
```

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  헤더 바 (fixed, backdrop-blur)                          │
│  🔴 재난대응 시뮬레이터  [폭우][지진][한파][화학사고]    │
└─────────────────────────────────────────────────────────┘
│                                                          │
│              Leaflet 지도 (100vh)                        │
│                                                          │
│  ┌──────────────────┐         ┌──────────────────────┐  │
│  │ 플로팅 컨트롤     │         │  우측 슬라이드 패널   │  │
│  │ 📍 내 위치 선택   │         │  (시뮬레이션 결과)    │  │
│  │ [지도 클릭 / GPS] │         └──────────────────────┘  │
│  │ [▶ 시뮬레이션 실행]│                                   │
│  └──────────────────┘                                    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  범례: ■위험 ■경계 ■주의  ●대피소 ★추천 TOP3    │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

## Data Structure

### 재난 유형 (4종)

```js
const DISASTERS = [
  { code: 'FLOOD',    name: '폭우',     color: '#3b82f6', icon: '🌧️' },
  { code: 'QUAKE',    name: '지진',     color: '#f97316', icon: '🌍' },
  { code: 'COLD',     name: '한파',     color: '#67e8f9', icon: '❄️' },
  { code: 'CHEMICAL', name: '화학사고', color: '#a855f7', icon: '☣️' }
];
```

### 대피소 (20개, 서울 실제 좌표 기반 가상 데이터)

```js
const SHELTERS = [
  {
    id: 1,
    name: '강남구민체육관',
    lat: 37.5172, lng: 127.0473,
    capacity: 500,
    current: 120,          // 현재 수용 인원 (가상)
    floorLvl: 2,           // 층수 (한파·화학사고 보너스 판정용)
    suitable: ['FLOOD', 'COLD'],  // 적합 재난유형 (점수·reason 판정용)
    operateYn: true
  },
  // ... 19개 더
];
```

### 위험지역 (재난유형별 GeoJSON Polygon)

```js
const DANGER_ZONES = {
  FLOOD:    [{ riskLevel: 3, name: '강남 저지대', coords: [[...]] }, ...],
  QUAKE:    [{ riskLevel: 2, name: '은평 단층 인근', coords: [[...]] }, ...],
  COLD:     [{ riskLevel: 1, name: '노원 고령밀집지역', coords: [[...]] }, ...],
  CHEMICAL: [{ riskLevel: 3, name: '마포 산업단지', coords: [[...]] }, ...]
};
```

각 재난유형별 위험지역 3~5개, riskLevel 1~3 혼합.

## Simulation Logic

### 점수 계산 (100점 만점)

| 항목 | 만점 | 계산식 |
|---|---|---|
| 거리 점수 | 40점 | `40 × max(0, 1 - distanceM / 5000)` |
| 수용 여유 | 25점 | `25 × (1 - current / capacity)` |
| 재난 적합 | 20점 | 적합유형 포함 20, 미포함 5 |
| 운영 여부 | 10점 | 운영중 10, 미운영 0 |
| 층수 보너스 | 5점 | 한파·화학사고 + 3층↑ 이면 +5 |

### Haversine 거리 계산 (JS)

```js
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
```

### 추천 알고리즘

1. 반경 5km 내 대피소 필터
2. `operateYn: true` 필터
3. 각 대피소 점수 계산
4. 내림차순 정렬 → 상위 3개 반환
5. reason 문자열 자동 생성 (규칙 기반)

**reason 생성 규칙:**

| 조건 | 추가 문구 |
|---|---|
| suitable 포함 | "재난유형 적합" |
| suitable 미포함 | "재난유형 부적합 (차선)" |
| current / capacity < 0.3 | "수용 여유 충분" |
| current / capacity > 0.7 | "수용 거의 찼음" |
| distanceM < 1000 | "도보 약 {n}분" |
| distanceM >= 1000 | "약 {n}km 거리" |
| floorLvl >= 3 AND COLD/CHEMICAL | "고층 대피 유리" |
| operateYn false | "현재 미운영" |

조건을 순서대로 평가해 해당 문구들을 `·` 구분자로 결합.

## Right Slide Panel

시뮬레이션 실행 후 우측에서 슬라이드인 (transform translateX, 300ms ease).

```
┌────────────────────────────────┐
│  ✕  시뮬레이션 결과            │
│  📍 내 위치 기준 · 폭우        │
├────────────────────────────────┤
│  #1  강남구민체육관    88.4점  │
│  거리  ████████████  35.0 / 40 │
│  수용  █████████░░░  22.0 / 25 │
│  적합  ████████████  20.0 / 20 │
│  운영  ██████████    10.0 / 10 │
│  💬 침수 안전지역, 수용 여유 충분│
│  [📌 지도에서 보기]            │
├────────────────────────────────┤
│  #2  ...                       │
│  #3  ...                       │
└────────────────────────────────┘
```

카드 클릭 → 지도 pan + Leaflet 팝업 오픈.

## Interaction Flow

1. **재난유형 선택** → 위험지역 Polygon 레이어 교체, 대피소 마커 적합도 반영
2. **위치 지정** → 지도 클릭 시 📍 마커 드롭 / GPS 버튼 시 브라우저 위치
3. **시뮬레이션 실행** → 점수 계산 → 우측 패널 슬라이드인 → TOP3 마커 교체 → fitBounds
4. **카드 클릭** → 지도 pan → Leaflet 팝업 오픈
5. **재난유형 변경** → 패널 닫힘, 결과 초기화, 새 레이어 표시

## index.html 연동

기존 카드 그리드에 `disaster.html` 링크 카드 1개 추가.
카드 설명: "재난 대응 시뮬레이션 — 재난유형 선택 후 주변 대피소 추천"

## File Structure

```
disaster.html          신규 — 전체 앱 (head + style + body + script 인라인)
index.html             수정 — 카드 추가
```
