# Backtest 비교기 Design Spec

**Date:** 2026-04-06

## Goal

두 종목을 동일 투자금액으로 같은 기간에 투자했을 때의 수익률·평가금액·CAGR을 비교하는 백테스트 페이지를 추가한다. 새 standalone 페이지 `backtest.html`을 생성하고, `index.html` 라이브 카드에 추가한다.

---

## File Map

| File | Action |
|---|---|
| `backtest.html` | Create — 백테스트 비교기 페이지 |
| `index.html` | Modify — 라이브 카드에 백테스트 추가 (5번째) |

---

## Common Conventions

- 언어: 한국어 only, i18n 없음
- 테마: 라이트 모드 only
- 폰트: Inter (Google Fonts CDN)
- 상단 네비: 기존 topnav 패턴 (홈 | 공포탐욕지수 | 복리 계산기 | 목표 자산 | 매매일지 | 백테스트)
- 차트 라이브러리: Chart.js (CDN: `https://cdn.jsdelivr.net/npm/chart.js`)
- CORS 프록시: `/api/proxy?url=` + `encodeURIComponent(Yahoo URL)` (기존 패턴 동일)

---

## backtest.html — 레이아웃

```
[topnav]

[h1] 백테스트 비교기
[subtitle] 두 종목을 같은 조건으로 투자했을 때 결과를 비교합니다

┌─ 입력 카드 ─────────────────────────────────────┐
│  종목 A  [SPY          ]  종목 B  [QQQ          ]  │
│  투자금액  [10,000,000  ] 원                        │
│                                                     │
│  투자방식: ● 일괄투자  ○ 적립식(월)                │
│                                                     │
│  기간: [1M] [3M] [6M] [1Y] [3Y] [5Y]              │
│        시작일 [          ]  종료일 [          ]     │
│                                                     │
│                    [비교 시작 →]                    │
└─────────────────────────────────────────────────────┘

┌─ 요약 카드 A ──────┐  ┌─ 요약 카드 B ──────┐
│ SPY                 │  │ QQQ                 │
│ 누적수익률  +142%   │  │ 누적수익률  +89%    │
│ 최종 평가금 ₩2,420만│  │ 최종 평가금 ₩1,890만│
│ CAGR        18.3%   │  │ CAGR        12.7%   │
│ 🏆 수익 우위         │  │                     │
└─────────────────────┘  └─────────────────────┘

┌─ 차트 카드 ─────────────────────────────────────┐
│  [누적 수익률] [평가금액]  ← 탭                   │
│  [Chart.js 라인 차트 — A: #3b82f6, B: #f97316]   │
│  툴팁: hover 시 날짜 + A/B 값 동시 표시           │
└─────────────────────────────────────────────────┘

┌─ 수치 비교 표 ───────────────────────────────────┐
│           │    A      │    B      │   차이        │
│ 누적수익률│  +142%    │  +89%     │  +53%p       │
│ 최종평가금│  ₩2,420만 │  ₩1,890만 │  +₩530만     │
│ CAGR      │  18.3%    │  12.7%    │  +5.6%p      │
│ 투자기간  │              공통                     │
└─────────────────────────────────────────────────┘
```

---

## 입력 필드 상세

| 필드 | 기본값 | 설명 |
|---|---|---|
| 종목 A | `SPY` | Yahoo Finance 심볼 (예: `AAPL`, `005930.KS`, `BTC-USD`) |
| 종목 B | `QQQ` | 동일 |
| 투자금액 | 10,000,000 | 일괄투자: 1회 투자금, 적립식: 월 투자금 |
| 투자방식 | 일괄투자 | 라디오 버튼 전환, 전환 시 재조회 필요 |
| 기간 버튼 | 1Y | 1M / 3M / 6M / 1Y / 3Y / 5Y |
| 커스텀 날짜 | 빈 값 | 시작일/종료일 입력 시 버튼 기간보다 우선 적용 |

**종목 입력 안내:** placeholder에 "예: AAPL, 005930.KS, BTC-USD" 표시

---

## 데이터 흐름

```
[비교 시작] 클릭
  → 두 종목 Yahoo Finance v8/chart API 병렬 fetch (Promise.all)
  → URL: CORS_PROXY + encodeURIComponent(
      https://query1.finance.yahoo.com/v8/finance/chart/{SYM}
      ?range={range}&interval=1d
    )
  → 커스텀 날짜 사용 시: range 대신 period1/period2 Unix timestamp 사용
  → 응답에서 timestamp 배열 + adjclose 배열 추출
  → 계산 실행 → 결과 렌더링
```

**기간 버튼 → Yahoo range 매핑:**

| 버튼 | range |
|---|---|
| 1M | 1mo |
| 3M | 3mo |
| 6M | 6mo |
| 1Y | 1y |
| 3Y | 3y |
| 5Y | 5y |

---

## 계산 로직

### 일괄투자 (Lump Sum)

```
prices[i] = adjclose 배열 (i = 0..n)
shares = 투자금액 / prices[0]
value[i] = shares * prices[i]
수익률[i] = (value[i] / 투자금액 - 1) * 100
최종평가금 = value[n]
총투자금 = 투자금액
CAGR = (최종평가금 / 총투자금)^(1 / 년수) - 1
  (년수 = (종료 ms - 시작 ms) / (365.25 * 24 * 3600 * 1000))
```

### 적립식 (DCA)

```
매월 첫 거래일(월별 첫 번째 timestamp)에 월_투자금 / prices[해당일] 주식 매수
totalShares = 누적 매수 주식수
totalInvested = 월_투자금 * 경과_월수
value[i] = totalShares_at_i * prices[i]
수익률[i] = (value[i] / totalInvested_at_i - 1) * 100
최종평가금 = value[n]
CAGR = (최종평가금 / totalInvested)^(1 / 년수) - 1
```

---

## 결과 표시

### 요약 카드 (종목별)
- 종목명 (심볼)
- 누적수익률 (%, 소수점 1자리, 양수 `+` 접두사)
- 최종 평가금액 (한국 포맷: 만/억 단위)
- CAGR (%, 소수점 1자리)
- 🏆 수익 우위 배지: 누적수익률 기준 높은 쪽에만 표시 (동일 시 없음)

### 차트
- 탭 전환: 누적 수익률 (%) / 평가금액 (원)
- A: `#3b82f6` (파랑), B: `#f97316` (주황)
- X축: 날짜 (YYYY-MM-DD)
- Y축: % 또는 원화 (한국 포맷)
- 툴팁: hover 시 날짜 + A값 + B값 동시 표시

### 수치 비교 표
| 항목 | A | B | 차이 |
|---|---|---|---|
| 누적수익률 | +X% | +Y% | ±Z%p |
| 최종평가금 | ₩X | ₩Y | ±₩Z |
| CAGR | X% | Y% | ±Z%p |
| 투자기간 | 공통 (콜스팬) |

차이 열: 우위 종목 방향으로 색상 (초록/빨강)

---

## 예외 처리

| 상황 | 처리 |
|---|---|
| 심볼 조회 실패 (404 / 빈 응답) | 해당 카드에 "데이터를 불러올 수 없습니다" 표시, 상대 종목 정상 표시 |
| 기간 내 거래일 0개 | "선택한 기간에 거래 데이터가 없습니다" 안내 |
| 커스텀 종료일 < 시작일 | 입력 필드 빨간 테두리 + "날짜를 확인해주세요" 메시지 |
| adjclose 배열 길이 불일치 | 두 종목의 공통 날짜만 필터링하여 사용 |
| 네트워크 오류 | "네트워크 오류가 발생했습니다. 다시 시도해주세요" |

---

## index.html 업데이트

라이브 카드 5번째에 추가:
```html
<a href="/backtest.html" class="tool-card live">
  <div class="tool-card-top">
    <span class="tool-icon">📈</span>
    <span class="tool-tag tag-live">Live</span>
  </div>
  <div class="tool-info">
    <div class="tool-name">백테스트 비교기</div>
    <div class="tool-desc">두 종목을 같은 조건으로 투자 시 수익률·CAGR 비교</div>
  </div>
</a>
```

---

## Out of Scope

- 3개 이상 종목 비교
- MDD, 변동성, 샤프 비율
- 다크모드 / 언어 토글
- 배당 재투자 계산
- 수수료·세금 반영
- 결과 공유 기능
