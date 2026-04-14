# Design: Market Features — Score Interpreter & Portfolio Calculator

**Date:** 2026-03-31  
**Status:** Approved

## Overview

두 가지 기능을 Overview 탭의 게이지 아래에 추가한다. 헤더의 subtitle 텍스트("CNN market sentiment tracker · Learn more about the index")는 삭제한다.

---

## Feature 1: 시장 심리 해석기 (Score Interpreter)

### 위치
게이지 캔버스 + `gauge-footer` 바로 아래, `.main-content` 안 `.gauge-section` 하단.

### 동작
현재 공포·탐욕 점수를 5개 구간으로 나눠 3줄 해석 텍스트를 표시한다.

| 구간 | 레이블 |
|------|--------|
| 0–25 | Extreme Fear |
| 25–45 | Fear |
| 45–55 | Neutral |
| 55–75 | Greed |
| 75–100 | Extreme Greed |

각 구간마다 3개 항목을 표시한다:
- **현재 시장**: 현재 분위기 설명
- **역사적 패턴**: 해당 구간의 역사적 의미
- **시사점**: 투자자가 알아야 할 포인트

### i18n
`TRANSLATIONS.en` / `TRANSLATIONS.ko` 에 각 구간별 텍스트 3줄씩 총 30개 키 추가. `applyData()` 호출 시 현재 점수 기반으로 해석기 업데이트.

### 스타일
구간 색상은 기존 CSS 변수(`--clr-extreme-fear` 등) 재사용. 카드 스타일은 기존 `.mkt-strip` 패턴 따름.

---

## Feature 2: 포트폴리오 수익률 계산기 (Portfolio Calculator)

### 위치
해석기 아래, Overview 탭 내.

### 입력
- 티커 심볼 (Yahoo Finance 형식, 예: `AAPL`, `005930.KS`, `BTC-USD`)
- 수량 (소수점 허용)
- 매입가 (소수점 허용)

### 데이터 페치
기존 `CORS_PROXY` (`/api/proxy?url=`) + Yahoo Finance `v8/chart` API 재사용. 심볼당 1회 호출, `meta.regularMarketPrice` 로 현재가 추출.

### 계산
- 평가금액 = 현재가 × 수량
- 수익/손실 = 평가금액 − (매입가 × 수량)
- 수익률 = (현재가 − 매입가) / 매입가 × 100

### 상태 저장
항목 목록을 `localStorage('fg-portfolio')` 에 JSON 저장. 앱 로드 시 복원, 현재가는 매번 새로 fetch.

### 표시
- 종목별 행: 심볼 / 현재가 / 평가금액 / 수익률(색상 구분)
- 하단 합계 행: 총 매입금액 / 총 평가금액 / 전체 수익률
- 항목 삭제 버튼(×) 각 행에 포함
- 로딩 중 스켈레톤, 조회 실패 시 "N/A" 표시

---

## 삭제 항목

헤더 `<p>` 태그 내 subtitle span과 learnMore 링크 제거. `TRANSLATIONS`에서 `subtitle`, `learnMore` 키도 함께 제거. `.project-name`(Fear & Greed Index 서브타이틀)은 유지.

---

## 기술 제약

- 빌드 없음, 단일 `index.html` 파일 내 모든 코드
- 추가 라이브러리 없음
- 모바일 반응형 (680px 브레이크포인트 기준)
