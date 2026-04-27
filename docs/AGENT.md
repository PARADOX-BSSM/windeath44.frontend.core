# windeath44 — Agent Guide

AI 에이전트가 이 프로젝트에서 작업할 때 따라야 할 가이드.

## Repository Conventions

### 패키지 구조 (모든 패키지 공통)

```
packages/<name>/
├── package.json        # name: @windeath44/<name>
├── tsconfig.json       # extends ../../tsconfig.base.json
├── tsup.config.ts
├── src/
│   ├── index.ts        # public barrel — 명시적으로 export
│   ├── types.ts        # 모든 TypeScript 인터페이스
│   └── __tests__/      # Vitest 테스트
└── README.md
```

### TypeScript 규칙

- `strict: true` 항상 유지
- `any` 사용 금지 — `unknown` 사용 후 타입 가드로 좁히기
- React 컴포넌트는 함수형 + 훅만 사용
- 인터페이스 > 타입 별칭 (확장 가능성)
- 모든 public API에 JSDoc 불필요 — 타입으로 충분

### 파일명 컨벤션

| 종류 | 형식 | 예시 |
|------|------|------|
| React 컴포넌트 | PascalCase.tsx | `Window.tsx` |
| 훅 | camelCase.ts | `useProcess.ts` |
| 클래스 | PascalCase.ts | `ProcessManager.ts` |
| 타입 전용 | types.ts | `types.ts` |
| 테스트 | `*.test.ts(x)` | `ProcessManager.test.ts` |

### React 패턴

- Context는 항상 null 체크 포함: `if (!ctx) throw new Error(...)`
- useEffect cleanup 반드시 반환
- 이벤트 리스너는 useEffect 내에서만 등록
- Zustand 스토어는 훅 형태로만 노출

### 브라우저 API 가드 (SSR 안전)

```typescript
import { isBrowser } from '@windeath44/ssr';

// 브라우저 전용 코드
if (isBrowser()) {
  window.addEventListener(...)
}
```

### IPC 채널 추가 방법

1. `packages/kernel/src/ipc/SystemEventMap.ts`에 채널 추가
2. 또는 feature 패키지에서 declaration merging:

```typescript
// packages/vfs/src/index.ts
declare module '@windeath44/kernel' {
  interface SystemEventMap {
    'fs:changed': { path: string };
  }
}
```

### 프로세스 등록 방법

```typescript
// feature bootstrap function
export function myFeature(kernel: Kernel): void {
  kernel.spawn({
    name: 'my-service',
    kind: 'service',
    parentPid: kernel.initProcess.pid,
    metadata: {
      displayName: 'My Service',
      version: '0.1.0',
      packageId: '@windeath44/my-package',
    },
  });
}
```

## Testing Guidelines

- **순수 로직**: React 없이 단위 테스트
- **훅/컨텍스트**: `renderHook` + `act` 사용
- **브라우저 API**: `jsdom` 환경 또는 `vi.mock`
- **각 패키지**: `pnpm test` 단독 실행 가능해야 함

## Commit Workflow

1. 기능 단위로 브랜치 생성: `feat/kernel`, `feat/vfs`
2. 구현 완료 후 `pnpm changeset` 실행
3. PR 생성 → 머지
4. 배포: `pnpm release`

## Adding a New Package

```bash
mkdir packages/my-package
cd packages/my-package
# package.json, tsconfig.json, tsup.config.ts 생성
# docs/PLAN.my-package.md 작성
```

`pnpm-workspace.yaml`에 추가 불필요 — `packages/*` 글로브로 자동 감지.

## Common Pitfalls

- `initKernel()`은 앱당 한 번만 호출 (KernelProvider가 담당)
- `LocalStorageAdapter`/`IndexedDBAdapter`는 서버에서 instantiate 금지
- `.pdui` 핸들러 문자열은 절대 `eval`/`Function()`으로 해석하지 않음
- `"type": "module"` 루트 package.json에 설정 금지 (tsup이 .cjs/.js 명시 처리)
