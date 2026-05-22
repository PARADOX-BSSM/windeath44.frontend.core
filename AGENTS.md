<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-05-22 | Updated: 2026-05-22 -->

# @windeath44/core

## Purpose
Web-based OS 아키텍처 라이브러리. React 앱 위에 프로세스 기반 OS 추상화(커널, IPC, 윈도우 매니저, VFS 등)를 제공한다. `windeath44.frontend`가 의존하는 핵심 라이브러리이며 npm에 배포된다. **이 패키지의 소스(`src/`)를 직접 읽는 대신 `docs/` API 레퍼런스를 사용할 것.**

## Key Files

| File | Description |
|------|-------------|
| `package.json` | 패키지 메타데이터, subpath exports 정의, 빌드 스크립트 |
| `tsup.config.ts` | tsup 번들러 설정 — CJS/ESM 듀얼 출력, 모듈별 entry 정의 |
| `tsconfig.json` | TypeScript 설정 (strict mode) |
| `vitest.config.ts` | Vitest 테스트 설정 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | 라이브러리 소스 코드 — see `src/AGENTS.md` |
| `docs/` | Core 라이브러리 상세 가이드 (AGENT.md, DESIGN.md, COMMIT_CONVENTION.md) |
| `dist/` | 빌드 출력물 (gitignore) — 직접 편집 금지 |

## Subpath Exports

모든 import는 subpath를 사용한다. `@windeath44/core`를 직접 import하지 말 것.

| Subpath | 모듈 |
|---------|------|
| `@windeath44/core/react` | KernelProvider, useProcess, useIPCSubscribe, useIPCPublish, useMarkReady |
| `@windeath44/core/app-registry` | AppManifest 타입, AppRegistryProvider |
| `@windeath44/core/window` | useWindowManager, WindowManagerProvider |
| `@windeath44/core/shell` | Desktop, WindowLayer, useDisplay, shellFeature |
| `@windeath44/core/notifications` | useNotifications, NotificationProvider |
| `@windeath44/core/context-menu` | useContextMenu, ContextMenuProvider |
| `@windeath44/core/drag-drop` | useDraggable, useDroppable, DragDropProvider |
| `@windeath44/core/pdui` | PduiParser, PduiRenderer, defaultRegistry |
| `@windeath44/core/router` | useRouter, RouterProvider |
| `@windeath44/core/vfs` | useFS, MemoryAdapter, LocalStorageAdapter |
| `@windeath44/core/theme` | useTheme, ThemeProvider |
| `@windeath44/core/keyboard` | useKeybinding, KeymapProvider |
| `@windeath44/core/clipboard` | useClipboard, ClipboardProvider |
| `@windeath44/core/ssr` | isBrowser, SSRProvider |

## For AI Agents

### Working In This Directory
- 변경 전 반드시 `docs/AGENT.md`와 `docs/DESIGN.md`를 읽는다.
- 커밋 메시지는 `docs/COMMIT_CONVENTION.md` 형식을 따른다.
- 새 모듈 추가 시: `src/`에 디렉토리 생성 → `tsup.config.ts` entry 추가 → `package.json` exports 추가 → `docs/`에 API 문서 추가.
- subpath export를 추가/변경하면 workspace root의 `docs/api/` 문서도 업데이트한다.

### Testing Requirements
```bash
pnpm test          # Vitest 단위 테스트
pnpm typecheck     # TypeScript 타입 체크
pnpm build         # tsup 번들 빌드 (dist/ 생성)
```

### Common Patterns
- 각 모듈은 `src/<module>/index.ts`에서 public API만 export.
- Provider 패턴: Context + Provider 컴포넌트 + 훅.
- SSR 안전: 브라우저 API 사용 시 `isBrowser()` 가드.

## Dependencies

### External
- React 18+ (peerDependency)
- tsup — CJS/ESM 듀얼 번들링
- Vitest — 단위 테스트

<!-- MANUAL: -->
