<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-22 | Updated: 2026-05-22 -->

# core/src/window

## Purpose
윈도우 매니저 모듈. 데스크톱 환경에서 앱 창의 open/close/focus/minimize/maximize/resize를 관리한다. `@windeath44/core/window` subpath로 export. 상세 API: `packages/core/docs/window.md` (frontend docs).

## Key Files

| File | Description |
|------|-------------|
| `WindowManagerProvider.tsx` | 윈도우 매니저 Context + Provider |
| `WindowStore.ts` | 윈도우 상태 저장소 (open windows 목록, z-index 관리) |
| `AppNavStack.ts` | 앱 내 네비게이션 스택 |
| `index.ts` | public API: WindowManagerProvider, useWindowManager |
| `types.ts` | WindowState, WindowConfig 타입 |
| `README.md` | 윈도우 매니저 사용 가이드 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `components/` | `Window.tsx` — 실제 창 렌더링 컴포넌트 |
| `WindowTest/` | 단위 테스트 |

## For AI Agents

### Common Patterns
```typescript
import { useWindowManager } from '@windeath44/core/window';

const wm = useWindowManager();

// 창 열기
wm.open({ pid, title: '내 앱', children: <MyContent /> });

// 창 닫기
wm.close(windowId);
```

<!-- MANUAL: -->
