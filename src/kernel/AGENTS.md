<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-22 | Updated: 2026-05-22 -->

# core/src/kernel

## Purpose
`@windeath44/core`의 핵심 모듈. 프로세스 관리(spawn/kill/suspend/resume), 타입 안전 IPC 이벤트 버스, feature 기반 부트 시퀀스를 구현한다. 상세 API는 `docs/AGENT.md`와 `docs/DESIGN.md`를 참고.

## Key Files

| File | Description |
|------|-------------|
| `Kernel.ts` | 커널 클래스 — feature 초기화, ProcessManager/EventBus 조합 |
| `AppRegistry.ts` | 앱 매니페스트 등록/조회 |
| `index.ts` | 모듈 public API export |
| `README.md` | 커널 아키텍처 설명 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `ipc/` | IPC 이벤트 버스 — `EventBus.ts`, `KernelEventBus.ts`, `SystemEventMap.ts` |
| `process/` | 프로세스 매니저 — `ProcessManager.ts`, `types.ts` |
| `KernelTest/` | 단위 테스트 — Kernel, EventBus, ProcessManager |

## For AI Agents

### Working In This Directory
- IPC 채널 이름 형식: `"namespace:event"` (예: `"auth:login"`, `"memorial:open"`).
- 새 시스템 이벤트 추가 시 `ipc/SystemEventMap.ts`에 타입 등록.
- `initKernel()`은 앱에서 직접 호출 금지 — `KernelProvider`가 처리.
- `ProcessManager`는 React 외부에서도 동작 — SSR 안전.

### Testing Requirements
```bash
pnpm test   # KernelTest/ 포함 전체 테스트
```

## Dependencies

### External
- 순수 TypeScript — React 의존성 없음 (React 통합은 `src/react/`에서 담당)

<!-- MANUAL: -->
