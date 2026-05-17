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

---

## ViewManager (`@windeath44/core/router`)

앱 내부 뷰 전환을 관리하는 컨텍스트 기반 시스템. PDUi와 통합.

### Import

```typescript
import { ViewManagerProvider, useViewManager, defineViews } from '@windeath44/core/router';
```

### 기본 사용법

```tsx
import { PduiParser } from '@windeath44/core/pdui';
import { ViewManagerProvider, useViewManager, defineViews } from '@windeath44/core/router';

// 1. 뷰 설정 정의
type MyView = 'menu' | 'detail' | 'settings';

const myViewConfig = defineViews<MyView>(
  [
    { name: 'menu', pduiDocument: PduiParser.parse(JSON.stringify(menuPage)) },
    { name: 'detail', pduiDocument: PduiParser.parse(JSON.stringify(detailPage)) },
    { name: 'settings', pduiDocument: PduiParser.parse(JSON.stringify(settingsPage)) },
  ],
  'menu',
);

// 2. Provider로 감싸기
function MyApp() {
  return (
    <ViewManagerProvider config={myViewConfig}>
      <MyViewRenderer />
    </ViewManagerProvider>
  );
}

// 3. useViewManager로 뷰 제어
function MyViewRenderer() {
  const vm = useViewManager<MyView>();
  const doc = vm.currentViewDef.pduiDocument;
  if (!doc) return null;
  return <PduiRenderer document={doc} handlers={handlers} data={data} />;
}
```

### useViewManager API

```typescript
const vm = useViewManager<'menu' | 'detail'>();

vm.currentView       // 현재 뷰 이름
vm.currentViewDef    // 현재 ViewDefinition (pduiDocument 등)
vm.viewData          // 현재 뷰에 전달된 데이터
vm.viewHistory       // 뷰 히스토리 스택

vm.navigate('detail', { data: { id: 1 } });  // 새 뷰로 이동
vm.navigate('loading', { replace: true });    // 현재 뷰 교체
vm.back();           // 이전 뷰로 돌아가기
vm.canBack();        // 뒤로가기 가능 여부
vm.setData({ ... }); // 현재 뷰 데이터 업데이트
```

### ViewNavigateOptions

| 옵션 | 설명 |
|------|------|
| `replace` | 히스토리에 추가하지 않고 현재 뷰 교체 |
| `data` | 새 뷰에 전달할 데이터 |
| `skipHistory` | 히스토리 스택에 추가하지 않음 (일시적 뷰) |
