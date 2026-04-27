# PLAN: @windeath44/ssr

## 목적

모든 패키지가 SSR(Next.js, Express 등) 환경에서도 동작하도록
브라우저 API 접근을 안전하게 감싸는 가드와 hydration 인프라를 제공한다.
다른 모든 패키지가 이 패키지에 의존하므로 **가장 먼저** 구현한다.

## 디렉터리 구조

```
packages/ssr/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts
    ├── guards.ts
    ├── types.ts
    ├── serialize.ts
    ├── SSRProvider.tsx
    ├── useSSRContext.ts
    └── __tests__/
        ├── guards.test.ts
        └── serialize.test.ts
```

## TypeScript Interfaces

### `src/types.ts`

```typescript
export interface HydrationPayload {
  version: 1;
  router?: { initialPath: string; mode: 'hash' | 'history' };
  vfs?: unknown;       // SerializedFS from @windeath44/vfs
  pdui?: { documents: Record<string, unknown> };
  [key: string]: unknown;
}

export interface SSRContextValue {
  isServer: boolean;
  payload: HydrationPayload;
  mergePayload(slice: Partial<HydrationPayload>): void;
}
```

## 구현 상세

### `src/guards.ts`

```typescript
export const isBrowser = (): boolean =>
  typeof window !== 'undefined' && typeof document !== 'undefined';

export const isServer = (): boolean => !isBrowser();

export function canUseDOM<T>(accessor: () => T): T | undefined {
  if (!isBrowser()) return undefined;
  try { return accessor(); } catch { return undefined; }
}
```

### `src/serialize.ts`

- `serializeState(payload): string` — JSON.stringify + `</script>` 이스케이프
- `injectStateScript(payload): string` — `<script>window.__WINDEATH44_STATE__=...;</script>` 반환

### `src/SSRProvider.tsx`

- 서버: `payload` prop을 컨텍스트로 주입
- 클라이언트: `window.__WINDEATH44_STATE__` 읽어서 hydrate
- `mergePayload`로 하위 패키지들이 자신의 슬라이스를 등록

## 테스트

| 파일 | 테스트 항목 |
|------|------------|
| `guards.test.ts` | jsdom 환경에서 `isBrowser()=true`, Node 환경에서 `false` |
| `guards.test.ts` | `canUseDOM`이 예외를 catch하고 undefined 반환 |
| `serialize.test.ts` | `</script>` 문자열 이스케이프 처리 |
| `serialize.test.ts` | `injectStateScript` 출력이 유효한 HTML script 태그 |

## 의존성

- peerDependencies: `react >=18`
- devDependencies: `typescript`, `tsup`, `vitest`, `@types/react`
