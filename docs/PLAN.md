# windeath44 — Feature Plan Index

각 기능의 상세 설계는 `docs/plans/` 폴더에서 확인한다.

## 구현 순서

### Phase 1 — Core Infrastructure
| # | 파일 | 패키지 | 상태 |
|---|------|--------|------|
| 1 | [PLAN.ssr.md](plans/PLAN.ssr.md) | `@windeath44/ssr` | 미구현 |
| 2 | [PLAN.kernel.md](plans/PLAN.kernel.md) | `@windeath44/kernel` | 미구현 |
| 3 | [PLAN.ipc.md](plans/PLAN.ipc.md) | `@windeath44/ipc` (kernel 내부) | 미구현 |
| 4 | [PLAN.react-kernel.md](plans/PLAN.react-kernel.md) | `@windeath44/react-kernel` | 미구현 |

### Phase 2 — UI System
| # | 파일 | 패키지 | 상태 |
|---|------|--------|------|
| 5 | [PLAN.theme.md](plans/PLAN.theme.md) | `@windeath44/theme` | 미구현 |
| 6 | [PLAN.window.md](plans/PLAN.window.md) | `@windeath44/window-manager` | 미구현 |
| 7 | [PLAN.shell.md](plans/PLAN.shell.md) | `@windeath44/shell` | 미구현 |
| 8 | [PLAN.notifications.md](plans/PLAN.notifications.md) | `@windeath44/notifications` | 미구현 |
| 9 | [PLAN.context-menu.md](plans/PLAN.context-menu.md) | `@windeath44/context-menu` | 미구현 |
| 10 | [PLAN.drag-drop.md](plans/PLAN.drag-drop.md) | `@windeath44/drag-drop` | 미구현 |

### Phase 3 — Data & Navigation
| # | 파일 | 패키지 | 상태 |
|---|------|--------|------|
| 11 | [PLAN.router.md](plans/PLAN.router.md) | `@windeath44/router` | 미구현 |
| 12 | [PLAN.vfs.md](plans/PLAN.vfs.md) | `@windeath44/vfs` | 미구현 |

### Phase 4 — UI DSL & Extensions
| # | 파일 | 패키지 | 상태 |
|---|------|--------|------|
| 13 | [PLAN.pdui.md](plans/PLAN.pdui.md) | `@windeath44/pdui` | 미구현 |
| 14 | [PLAN.keyboard.md](plans/PLAN.keyboard.md) | `@windeath44/keyboard` | 미구현 |
| 15 | [PLAN.clipboard.md](plans/PLAN.clipboard.md) | `@windeath44/clipboard` | 미구현 |
| 16 | [PLAN.app-registry.md](plans/PLAN.app-registry.md) | `@windeath44/app-registry` | 미구현 |

## Scope 원칙

이 core 레포는 OS 인프라 레이어만 포함한다.
앱(터미널, 파일 매니저 등)은 별도 패키지에서 `@windeath44/*`를 의존성으로 사용한다.
