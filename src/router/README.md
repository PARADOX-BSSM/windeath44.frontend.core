# windeath44.core/router

프로세스 단위 딥링크 + 해시/히스토리 기반 URL 네비게이션.

## Import

```typescript
import { RouterProvider, useRouter } from 'windeath44.core/router';
```

## 기본 사용법

```tsx
import { RouterProvider, useRouter } from 'windeath44.core/router';

const routes = [
  { path: '/home', processName: 'home' },
  { path: '/files/:path*', processName: 'file-manager' },
  { path: '/app/:id', processName: 'app-runner' },
];

function App() {
  return (
    <RouterProvider mode="hash" routes={routes}>
      <Shell />
    </RouterProvider>
  );
}

function Shell() {
  const { location, match, navigate } = useRouter();
  return (
    <div>
      <span>현재 위치: {location}</span>
      <span>프로세스: {match?.route.processName}</span>
      <button onClick={() => navigate('/home')}>홈</button>
    </div>
  );
}
```

## useRouter API

```typescript
const {
  location,              // 현재 경로 문자열
  match,                 // RouteMatch | null
  navigate(path, opts?), // 이동 (opts.replace=true 이면 replace)
  navigateDeepLink(url), // windeath44:// 딥링크로 이동
  back(),
  forward(),
} = useRouter();
```

## 딥링크 형식

```
windeath44://processName/path?key=value
windeath44://terminal/logs?filter=error
windeath44://file-manager/home/user/documents
```

```typescript
import { encodeDeepLink, decodeDeepLink } from 'windeath44.core/router';

encodeDeepLink({ processName: 'terminal', path: '/logs', query: { filter: 'error' } });
// → 'windeath44://terminal/logs?filter=error'

decodeDeepLink('windeath44://terminal/logs?filter=error');
// → { processName: 'terminal', path: '/logs', query: { filter: 'error' } }
```

## matchRoute

```typescript
import { matchRoute } from 'windeath44.core/router';

matchRoute('/files/home/user/docs', routes);
// → { route, params: { path: 'home/user/docs' }, rest: '' }
```

- `:param` — 단일 세그먼트
- `:param*` — 나머지 전체 (greedy)

## RouterMode

| mode | 설명 |
|------|------|
| `hash` (기본) | `#/path` — SPA, 서버 설정 불필요 |
| `history` | `/path` — pushState, 서버 fallback 필요 |

## Tests

```
src/router/RouterTest/
├── matchRoute.test.ts       — 6 tests
├── deepLink.test.ts         — 6 tests
└── RouterProvider.test.tsx  — 6 tests
```
