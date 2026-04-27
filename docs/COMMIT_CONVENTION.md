# Commit Convention

[Conventional Commits](https://www.conventionalcommits.org/) 기반.

## 형식

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

## Types

| Type | 설명 |
|------|------|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `docs` | 문서만 변경 |
| `test` | 테스트 추가/수정 |
| `build` | 빌드 설정 변경 (tsup, turbo 등) |
| `chore` | 기타 (의존성 업데이트, 설정 등) |
| `refactor` | 기능 변경 없는 코드 정리 |
| `perf` | 성능 개선 |
| `ci` | CI/CD 설정 변경 |

## Scopes

| Scope | 패키지 |
|-------|--------|
| `monorepo` | 루트 설정 (package.json, turbo, tsconfig.base) |
| `ssr` | @windeath44/ssr |
| `kernel` | @windeath44/kernel |
| `ipc` | IPC / EventBus (kernel 패키지 내) |
| `react-kernel` | @windeath44/react-kernel |
| `theme` | @windeath44/theme |
| `window` | @windeath44/window-manager |
| `shell` | @windeath44/shell |
| `notifications` | @windeath44/notifications |
| `context-menu` | @windeath44/context-menu |
| `drag-drop` | @windeath44/drag-drop |
| `router` | @windeath44/router |
| `vfs` | @windeath44/vfs |
| `pdui` | @windeath44/pdui |
| `keyboard` | @windeath44/keyboard |
| `clipboard` | @windeath44/clipboard |
| `app-registry` | @windeath44/app-registry |
| `playground` | apps/playground |
| `docs` | docs/ 전체 |

## Examples

```
chore(monorepo): init pnpm workspace and turbo pipeline
docs: add DESIGN.md, AGENT.md, COMMIT_CONVENTION.md
feat(ssr): add isBrowser/isServer guards and SSRProvider
feat(kernel): implement ProcessManager and Kernel boot sequence
feat(ipc): add typed EventBus and KernelEventBus with pid purge
feat(react-kernel): add KernelProvider, useProcess, useIPC hooks
feat(theme): add ThemeProvider with light/dark/catppuccin themes
feat(window): implement WindowManager with drag and resize
feat(shell): add Desktop and Taskbar components
feat(notifications): add NotificationProvider and Toast queue
feat(context-menu): add ContextMenuProvider with viewport clamp
feat(drag-drop): add useDraggable and useDroppable hooks
feat(router): add RouterProvider and windeath44:// deep-link codec
feat(vfs): add VFSProvider with Memory/LocalStorage/IndexedDB adapters
feat(pdui): add PduiParser, ComponentRegistry, and PduiRenderer
feat(keyboard): add KeymapProvider with process-scoped shortcuts
feat(clipboard): add ClipboardProvider with browser API bridge
feat(app-registry): add AppRegistry and AppManifest type
feat(playground): wire all packages into Vite demo app
test(kernel): add ProcessManager lifecycle unit tests
test(ipc): add EventBus pub/sub and purge tests
test(vfs): add MemoryAdapter POSIX operation tests
fix(window): correct z-index stack on rapid focus changes
build(kernel): configure tsup dual ESM/CJS output
```

## Breaking Changes

```
feat(kernel)!: rename Kernel.boot() to Kernel.start()

BREAKING CHANGE: boot() has been renamed to start() for clarity.
```

## Notes

- subject는 소문자로 시작, 마침표 없음
- 한 커밋 = 한 기능 단위 (패키지 구현 + 해당 테스트 포함)
- `!` 접미사로 breaking change 표시
