# Repository Guidelines

이 저장소의 **전체 가이드는 `CLAUDE.md` 하나에 있습니다. 작업 전에 그 파일을 먼저 읽으세요.**
페이지별 아키텍처, 페이지 추가 시의 크로스파일 체크리스트, localStorage 키 맵, 서버리스 함수,
서비스워커, 주석 규약이 전부 거기 있고 — 이 파일은 그 내용을 중복해서 담지 않습니다.
설명이 CLAUDE.md와 어긋나면 CLAUDE.md가 맞습니다.

아래는 방향만 잡기 위한 요약입니다.

## 요약

- **빌드 없음.** `package.json`도, 번들러도, 테스트 스위트도, CI도 없습니다. 루트의 HTML 파일이 곧 제품이고
  각 페이지가 HTML·CSS·JS를 한 파일에 인라인으로 들고 있습니다. 서드파티는 전부 CDN `<script src>`입니다.
- **로컬 실행**: `npx serve . -l 8080` 또는 `python -m http.server 8080`. 단, `/api/*`는 Vercel
  서버리스 함수라 정적 서버에서는 존재하지 않습니다 — 실제로 돌리려면 `vercel dev`.
- **검증은 수동**입니다. 서버를 띄우고 바뀐 페이지를 데스크톱·모바일 폭에서 열어 콘솔을 확인하고,
  상태를 저장하는 페이지는 새로고침해서 localStorage 왕복까지 봅니다.
- **스타일**: 4-space 들여쓰기, JS `camelCase`, CSS `kebab-case`, 이중언어(en/ko) UI 패턴 유지.
  주석은 *무엇*이 아니라 *왜*를 씁니다. 자세한 배너/구분선 형식은 CLAUDE.md의 "Comment conventions".
- **페이지를 추가하면** `sw.js`(PRECACHE + `CACHE_NAME` 증가), `sitemap.xml`, `robots.txt`,
  `index.html`, `casestudy.html`이 자동으로 따라오지 않습니다. CLAUDE.md의 체크리스트를 그대로 밟으세요.
- **커밋**: 짧은 Conventional Commit 접두사 + 간결한 한국어 설명. 예: `fix: backtest 카드 정렬 보정`.
  PR에는 요약, 영향받은 페이지, 수동 테스트 노트, UI 변경 시 스크린샷을 넣습니다.
