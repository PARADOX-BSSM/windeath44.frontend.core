# windeath44 — Feature Plan Index

각 기능의 상세 설계는 `docs/plans/` 폴더에서 확인한다.

## 구현 순서

### Phase 1 — Core Infrastructure
| # | 파일 | 서브경로 | 상태 |
|---|------|----------|------|
| 1 | [PLAN.ssr.md](plans/PLAN.ssr.md) | `windeath44.core/ssr` | 미구현 |
| 2 | [PLAN.kernel.md](plans/PLAN.kernel.md) | `windeath44.core` | ✅ 구현 완료 |
| 3 | [PLAN.ipc.md](plans/PLAN.ipc.md) | `windeath44.core` (kernel 내부) | ✅ 구현 완료 |
| 4 | [PLAN.react-kernel.md](plans/PLAN.react-kernel.md) | `windeath44.core/react` | 미구현 |

### Phase 2 — UI System
| # | 파일 | 서브경로 | 상태 |
|---|------|----------|------|
| 5 | [PLAN.theme.md](plans/PLAN.theme.md) | `windeath44.core/theme` | 미구현 |
| 6 | [PLAN.window.md](plans/PLAN.window.md) | `windeath44.core/window` | 미구현 |
| 7 | [PLAN.shell.md](plans/PLAN.shell.md) | `windeath44.core/shell` | 미구현 |
| 8 | [PLAN.notifications.md](plans/PLAN.notifications.md) | `windeath44.core/notifications` | 미구현 |
| 9 | [PLAN.context-menu.md](plans/PLAN.context-menu.md) | `windeath44.core/context-menu` | 미구현 |
| 10 | [PLAN.drag-drop.md](plans/PLAN.drag-drop.md) | `windeath44.core/drag-drop` | 미구현 |

### Phase 3 — Data & Navigation
| # | 파일 | 서브경로 | 상태 |
|---|------|----------|------|
| 11 | [PLAN.router.md](plans/PLAN.router.md) | `windeath44.core/router` | 미구현 |
| 12 | [PLAN.vfs.md](plans/PLAN.vfs.md) | `windeath44.core/vfs` | 미구현 |

### Phase 4 — UI DSL & Extensions
| # | 파일 | 서브경로 | 상태 |
|---|------|----------|------|
| 13 | [PLAN.pdui.md](plans/PLAN.pdui.md) | `windeath44.core/pdui` | 미구현 |
| 14 | [PLAN.keyboard.md](plans/PLAN.keyboard.md) | `windeath44.core/keyboard` | 미구현 |
| 15 | [PLAN.clipboard.md](plans/PLAN.clipboard.md) | `windeath44.core/clipboard` | 미구현 |
| 16 | [PLAN.app-registry.md](plans/PLAN.app-registry.md) | `windeath44.core/app-registry` | 미구현 |

## 기능별 구현 규칙

각 기능을 구현할 때 반드시 아래 세 가지를 함께 작성한다:

1. **소스 코드** — `src/<feature>/`
2. **테스트** — `src/<feature>/<FeatureName>Test/` (예: `KernelTest/`)
   - 테스트 결과는 `logs/test-results.log`에 JSON으로 저장 (`.gitignore` 처리)
3. **README.md** — `src/<feature>/README.md`
   - import 방법, 주요 타입/클래스/훅 사용법, 테스트 실행 방법 포함

## Scope 원칙

이 레포는 OS 인프라 레이어만 포함하는 단일 npm 패키지(`windeath44.core`)다.
서브경로 exports로 기능별 import를 지원하며, `npm publish` 한 번으로 전체 배포한다.
앱(터미널, 파일 매니저 등)은 별도 패키지에서 `windeath44.core`를 의존성으로 사용한다.
