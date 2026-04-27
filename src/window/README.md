# windeath44.core/window

드래그·리사이즈·최소화·최대화 가능한 윈도우 관리 시스템.

## Import

```typescript
import {
  WindowManagerProvider,
  useWindowManager,
  Window,
} from 'windeath44.core/window';
```

## 기본 사용법

```tsx
import { WindowManagerProvider, useWindowManager, Window } from 'windeath44.core/window';

function App() {
  return (
    <WindowManagerProvider>
      <Desktop />
    </WindowManagerProvider>
  );
}

function Desktop() {
  const { windows, open } = useWindowManager();

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      {/* 열린 윈도우 렌더 */}
      {windows.map(w => <Window key={w.id} window={w} />)}

      {/* 새 윈도우 열기 */}
      <button onClick={() =>
        open({ pid: 1, title: 'My App', children: <div>Content</div> })
      }>
        Open Window
      </button>
    </div>
  );
}
```

## useWindowManager API

```typescript
const {
  windows,           // WindowState[] — 현재 열린 윈도우 목록
  open(options),     // 윈도우 열기, id 반환
  close(id),         // 닫기
  minimize(id),      // 최소화
  maximize(id),      // 최대화
  restore(id),       // 기본 크기로 복원
  focus(id),         // 최상단으로 올리기
  move(id, { x, y }),          // 위치 이동
  resize(id, { width, height }), // 크기 변경 (minSize 제한 적용)
} = useWindowManager();
```

## WindowState

```typescript
interface WindowState {
  id: string;
  pid: number;
  title: string;
  icon?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  minSize: { width: number; height: number };
  zIndex: number;
  status: 'normal' | 'minimized' | 'maximized';
  resizable: boolean;
  closable: boolean;
}
```

## Window 컴포넌트

```tsx
<Window window={windowState} />
```

- 타이틀바 드래그로 이동 (Pointer Events, pointer capture)
- 8방향 리사이즈 핸들 (minSize 제한)
- 최소화: `display: none`
- 최대화: `position: fixed; inset: 0`

## 주의 사항

- Pointer Events 기반 드래그/리사이즈는 jsdom에서 물리적으로 시뮬레이션 불가
- 실제 드래그 동작 검증은 Playwright E2E 테스트 필요

## Tests

```
src/window/WindowTest/
├── WindowStore.test.ts  — 13 tests (순수 상태 로직)
└── Window.test.tsx      — 6 tests (컴포넌트 렌더/버튼)
```

```bash
pnpm test
```
