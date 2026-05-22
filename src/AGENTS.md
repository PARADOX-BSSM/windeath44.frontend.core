<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-22 | Updated: 2026-05-22 -->

# @windeath44/core — src

## Purpose
라이브러리의 모든 소스 코드. 15개 기능 모듈로 구성되며 각각 독립적인 subpath export를 가진다. **직접 탐색 대신 `../docs/` API 레퍼런스를 사용할 것.**

## Key Files

| File | Description |
|------|-------------|
| `index.ts` | 루트 export — `kernel` 모듈만 re-export (내부 진입점) |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `kernel/` | OS 커널 — ProcessManager, KernelEventBus, IPC |
| `react/` | React 통합 레이어 — KernelProvider, 훅 모음 |
| `app-registry/` | 앱 등록/조회 시스템 |
| `window/` | 윈도우 매니저 — open/close/focus/resize |
| `shell/` | 데스크톱 디스플레이 레이어 — Desktop, WindowLayer |
| `notifications/` | 알림 시스템 |
| `context-menu/` | 우클릭 컨텍스트 메뉴 |
| `drag-drop/` | 드래그앤드롭 |
| `pdui/` | PDUI 마크업 언어 — 파서, 렌더러, 레지스트리 |
| `router/` | 라우팅 및 딥링크 |
| `vfs/` | 가상 파일시스템 — MemoryAdapter, LocalStorageAdapter |
| `theme/` | 테마 토큰 및 ThemeProvider |
| `keyboard/` | 키보드 단축키 시스템 |
| `clipboard/` | 클립보드 API |
| `ssr/` | SSR 가드 — isBrowser(), resolveApp() |

## For AI Agents

### Working In This Directory
- 각 모듈 디렉토리는 `index.ts`(public API), `types.ts`(타입), Provider/훅 파일, `*Test/` 디렉토리(테스트)로 구성.
- 새 모듈 추가 시 `tsup.config.ts`와 `package.json` exports도 함께 업데이트.
- 모듈 간 직접 import 금지 — 순환 의존성 방지. 공유 타입은 `types.ts`에 분리.

### Testing Requirements
- 각 모듈의 `*Test/` 디렉토리에 Vitest 단위 테스트 위치.
- `pnpm test` 로 전체 실행.

<!-- MANUAL: -->
