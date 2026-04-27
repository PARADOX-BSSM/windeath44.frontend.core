# windeath44.core/shell

윈도우들이 렌더되는 데스크톱 표면(surface). 태스크바·독·트레이는 소비자가 직접 구성한다.

## Import

```typescript
import { Desktop, WindowLayer, ScaleProvider, useScale, shellFeature } from 'windeath44.core/shell';
```

## 기본 사용법

```tsx
import { Desktop, ScaleProvider, shellFeature } from 'windeath44.core/shell';
import { KernelProvider } from 'windeath44.core/react';

function App() {
  return (
    <KernelProvider features={[shellFeature]}>
      <ScaleProvider>
        <Desktop wallpaper="#1e1e2e">
          <MyTaskbar />
        </Desktop>
      </ScaleProvider>
    </KernelProvider>
  );
}
```

## 컴포넌트

### `<Desktop>`

전체 화면 렌더 표면. `position: fixed; inset: 0`.
내부에 `<WindowLayer>`를 포함하며, `children`은 그 위에 렌더된다.

```tsx
<Desktop
  wallpaper="#1e1e2e"        // CSS background 값 (색상, 이미지 URL)
  style={{ cursor: 'default' }} // 추가 스타일
>
  <MyTaskbar />
</Desktop>
```

### `<WindowLayer>`

윈도우 z-스택 컨테이너. `position: absolute; inset: 0`.
`windeath44.core/window`의 `<Window>` 컴포넌트를 children으로 렌더한다.

```tsx
// Desktop 내부에서 자동 렌더됨
// 커스텀 사용 예시
<WindowLayer>
  {windows.map(w => <Window key={w.id} window={w} />)}
</WindowLayer>
```

### `<ScaleProvider>` / `useScale()`

HiDPI 스케일링. `devicePixelRatio` 기반 기본값, 사용자 조정 가능.

```tsx
const { scale, setScale, resetScale } = useScale();

// 2배 스케일
setScale(2);

// devicePixelRatio 기본값으로 복원
resetScale();
```

## shellFeature

커널 부트스트랩 시 shell 시스템 프로세스를 spawn한다.

```typescript
import { shellFeature } from 'windeath44.core/shell';
import { KernelProvider } from 'windeath44.core/react';

<KernelProvider features={[shellFeature]}>
  ...
</KernelProvider>
```

## 포함하지 않는 것 (소비자가 직접 구현)

- 태스크바 / 독
- 시스템 트레이 / 시계
- 바탕화면 아이콘 그리드
- 런처

## Tests

```
src/shell/ShellTest/
├── Desktop.test.tsx       — 7 tests (Desktop 스타일, WindowLayer 렌더)
└── ScaleProvider.test.tsx — 4 tests (기본값, setScale, resetScale, 에러)
```
