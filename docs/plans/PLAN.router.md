# PLAN: @windeath44/router

## 목적

프로세스/앱 단위의 딥링크 및 URL 기반 네비게이션.
`windeath44://processName/path` 형식의 딥링크 코덱과 해시/히스토리 어댑터를 제공한다.

## 디렉터리 구조

```
packages/router/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts
    ├── types.ts
    ├── RouterProvider.tsx
    ├── history/
    │   ├── IHistoryAdapter.ts
    │   ├── HashHistoryAdapter.ts
    │   └── BrowserHistoryAdapter.ts
    ├── deepLink.ts
    ├── matchRoute.ts
    ├── useRouter.ts
    └── __tests__/
        ├── matchRoute.test.ts
        ├── deepLink.test.ts
        └── RouterProvider.test.tsx
```

## TypeScript Interfaces

```typescript
export interface RouteDefinition {
  path: string;          // e.g. "/explorer/:path*"
  processName: string;
  params?: Record<string, string>;
}

export interface RouteMatch {
  route: RouteDefinition;
  params: Record<string, string>;   // static + dynamic 병합
  rest: string;
}

export interface DeepLink {
  processName: string;
  path: string;
  query: Record<string, string>;
}

export interface RouterContextValue {
  location: string;
  match: RouteMatch | null;
  navigate(path: string, options?: { replace?: boolean; state?: unknown }): void;
  navigateDeepLink(link: string): void;
  back(): void;
  forward(): void;
}

export interface HistoryAdapter {
  getLocation(): string;
  push(path: string, state?: unknown): void;
  replace(path: string, state?: unknown): void;
  back(): void;
  forward(): void;
  listen(cb: (location: string) => void): () => void;
}

export type RouterMode = 'hash' | 'history';
```

## 구현 상세

### 딥링크 형식

```
windeath44://terminal/logs?filter=error
windeath44://file-manager/home/user/documents
```

- `encodeDeepLink(link: DeepLink): string`
- `decodeDeepLink(raw: string): DeepLink | null` — 프로토콜 불일치 시 null

### matchRoute

- `:param` — 단일 세그먼트 캡처
- `:param*` — 나머지 전체 캡처 (greedy)
- 패턴을 named capture group 정규식으로 변환
- routes 배열 순서대로 첫 번째 매칭 반환

### HashHistoryAdapter

- `window.location.hash`에서 `#` 이후를 pathname으로 사용
- `popstate` 이벤트 리스닝
- SSR: `typeof window === 'undefined'` 시 `initialPath` 사용 (no-op stub)

### BrowserHistoryAdapter

- `window.history.pushState` / `replaceState`
- `popstate` 이벤트 리스닝

### RouterProvider

- `mode` prop으로 어댑터 선택 (기본값: `'hash'`)
- `initialPath` prop: SSR 주입 경로
- `useEffect`에서 어댑터 `listen` → location 상태 업데이트

## 테스트

| 파일 | 테스트 항목 |
|------|------------|
| `matchRoute.test.ts` | 정적 경로 매칭 |
| `matchRoute.test.ts` | `:param` 동적 세그먼트 추출 |
| `matchRoute.test.ts` | `:param*` greedy 캡처 |
| `matchRoute.test.ts` | 매칭 없을 때 null 반환 |
| `deepLink.test.ts` | 인코딩/디코딩 왕복 검증 |
| `deepLink.test.ts` | 다른 프로토콜 → null 반환 |
| `RouterProvider.test.tsx` | `navigate` 후 `location` 변경 |
| `RouterProvider.test.tsx` | `back/forward` 히스토리 이동 |

## 의존성

- `@windeath44/react-kernel`
- `@windeath44/ssr`
- peerDependencies: `react >=18`
