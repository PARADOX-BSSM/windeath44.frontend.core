<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-22 | Updated: 2026-05-22 -->

# core/src/router

## Purpose
라우팅 및 뷰 매니저 모듈. windeath44 앱 내 뷰 전환(ViewManager)과 URL 기반 딥링크를 제공한다. `@windeath44/core/router` subpath로 export. 상세 API: `packages/core/docs/router.md`.

## Key Files

| File | Description |
|------|-------------|
| `RouterProvider.tsx` | URL 라우터 Context |
| `navigationFeature.ts` | 커널 feature로 등록되는 라우터 초기화 |
| `deepLink.ts` | 딥링크 파싱/생성 유틸리티 |
| `matchRoute.ts` | 경로 매칭 유틸리티 |
| `index.ts` | public API: RouterProvider, useRouter, ViewManagerProvider, useViewManager |
| `types.ts` | Route, ViewManagerConfig 타입 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `history/` | `BrowserHistoryAdapter.ts`, `HashHistoryAdapter.ts` |
| `view-manager/` | `ViewManagerProvider.tsx`, `types.ts` — 앱 내 뷰 전환 |
| `RouterTest/` | 단위 테스트 |

## For AI Agents

### Common Patterns
```typescript
import { ViewManagerProvider, useViewManager } from '@windeath44/core/router';

// 앱에서 뷰 전환
const vm = useViewManager<MyView>();
vm.navigate('detail');
vm.currentView; // 현재 뷰 이름
vm.currentViewDef.pduiDocument; // 현재 뷰 PDUI 문서
```

<!-- MANUAL: -->
