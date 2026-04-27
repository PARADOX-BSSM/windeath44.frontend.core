# windeath44 — Architecture Design

## Overview

windeath44는 브라우저에서 동작하는 운영체제 아키텍처 라이브러리다.
TypeScript + React로 구현되며, 모든 기능은 **Process** 단위로 모델링된다.

## Scope: Core Library Only

이 레포지토리(`windeath44/core`)는 **라이브러리 코어**만 포함한다.

- **포함**: OS 인프라 패키지 (`@windeath44/*`) — 커널, IPC, 윈도우 관리, VFS, 라우터 등
- **포함**: `apps/playground` — 개발용 샌드박스 (npm 배포 대상 아님)
- **미포함**: 사용자 앱 (터미널, 파일 매니저, 설정 앱 등) — 별도 레포 또는 소비자 패키지에서 구현
- **미포함**: 특정 서비스/비즈니스 로직

`@windeath44/*` 패키지는 **OS 레이어 추상화**만 제공하며, 그 위에서 동작하는 앱은
이 core를 의존성으로 추가해 독립적으로 개발한다.

```
[windeath44/core]          → npm 배포 (@windeath44/*)
        ↓ peerDependency
[my-app]                   → windeath44 코어를 사용하는 소비자 앱
```

## Core Principle: Everything is a Process

데스크톱 환경, 백그라운드 서비스, 사용자 앱 모두 `Process` 인터페이스를 따른다.
`ProcessManager`가 수명주기(spawn → running → suspended/killed)를 관리한다.

```
Kernel
 ├── ProcessManager   — spawn / kill / suspend / resume
 ├── KernelEventBus   — 타입 안전 IPC (채널별 pub/sub)
 └── Boot sequence    — feature[] 순서대로 초기화
```

## Package Dependency Graph

```
@windeath44/ssr                 (no deps)
       ↑
@windeath44/kernel              (ssr)
       ↑
@windeath44/ipc                 (kernel)
       ↑
@windeath44/react-kernel        (kernel, ipc, react)
       ↑
@windeath44/theme               (react)
@windeath44/window-manager      (react-kernel, theme)
@windeath44/shell               (react-kernel, window-manager, theme, app-registry)
@windeath44/notifications       (react-kernel, theme)
@windeath44/context-menu        (react-kernel, theme)
@windeath44/drag-drop           (react)
@windeath44/router              (react-kernel, ssr)
@windeath44/vfs                 (react-kernel, ssr)
@windeath44/pdui                (react-kernel, vfs, ssr)
@windeath44/keyboard            (react-kernel)
@windeath44/clipboard           (react-kernel)
@windeath44/app-registry        (react-kernel)
```

## Process Kinds

| Kind | 설명 | 사용자 Kill 가능 |
|------|------|----------------|
| `system` | 커널 수준, 필수 서비스 | 불가 |
| `service` | 백그라운드, UI 없음 | 가능 |
| `app` | 사용자 앱, 윈도우 보유 | 가능 |

## IPC Channel Convention

채널명은 `namespace:event` 형식을 따른다.

```
process:spawned / process:killed / process:suspended / process:resumed
window:open / window:close / window:focus / window:minimize
desktop:ready
app:message
fs:read / fs:write / fs:watch
```

Feature 패키지는 declaration merging으로 `SystemEventMap`을 확장한다:

```typescript
declare module '@windeath44/kernel' {
  interface SystemEventMap {
    'fs:read': { path: string };
  }
}
```

## .pdui Format

UI를 JSON으로 선언하는 DSL. WinForms에서 영감.

- MIME: `application/vnd.windeath44.pdui+json`
- 확장자: `.pdui`
- 구조: `{ version, meta, root: PduiNode, handlers, renderers }`
- `PduiNode`: `{ type, props?, children?, events? }`
- 런타임에 `ComponentRegistry`로 위젯 해석 → React 엘리먼트 렌더

## SSR Strategy

- 모든 브라우저 API 접근은 `isBrowser()` 가드로 보호
- `SSRProvider`가 서버 상태를 `window.__WINDEATH44_STATE__`로 주입
- `RouterProvider`, `VFSProvider`는 `SSRProvider`에서 `initialPath`, `SerializedFS`를 읽어 hydrate
- Next.js App Router: 모든 Provider는 `"use client"` 경계 내부에 위치

## Monorepo Structure

- **pnpm workspaces** — phantom dependency 방지
- **Turborepo** — 증분 빌드, 태스크 파이프라인
- **tsup** — 각 패키지 ESM + CJS dual 빌드
- **Changesets** — 버전 관리 + npm 배포 (`@windeath44/*`)
- **Vitest** — 단위·통합 테스트
