# PLAN: @windeath44/shell

## 목적

윈도우들이 렌더되는 데스크톱 표면(surface)을 제공하는 최소 컨테이너.
태스크바, 시스템 트레이, 독, 아이콘 그리드 등 **사용자가 직접 구성해야 하는 UI는 포함하지 않는다.**

소비자 앱이 `<Desktop>` 위에 자신만의 레이아웃(태스크바 등)을 올리는 방식으로 사용한다.

## Scope

**포함**
- `<Desktop>` — 전체 화면 렌더 표면, 윈도우들의 부모 컨테이너
- `<WindowLayer>` — 윈도우 z-스택 렌더 영역
- `shellFeature` — shell 시스템 프로세스 부트스트랩 함수

**미포함** (소비자가 직접 구현)
- 태스크바 / 독
- 시스템 트레이
- 시계
- 바탕화면 아이콘 그리드
- 런처

## 디렉터리 구조

```
packages/shell/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts
    ├── shellFeature.ts
    ├── components/
    │   ├── Desktop.tsx      # 렌더 표면
    │   └── WindowLayer.tsx  # 윈도우 z-스택 컨테이너
    └── __tests__/
        └── Desktop.test.tsx
```

## TypeScript Interfaces

```typescript
export interface DesktopProps {
  /** 태스크바 등 소비자가 추가하는 UI */
  children?: ReactNode;
  /** CSS background 값 (색상, 이미지 URL 등) */
  wallpaper?: string;
  style?: CSSProperties;
}

export interface WindowLayerProps {
  children?: ReactNode;
}
```

## 구현 상세

### Desktop

- `position: fixed; inset: 0` — 전체 화면
- `overflow: hidden`
- `<WindowLayer>` 포함 (윈도우 렌더 영역)
- `children`을 그 위에 렌더 (소비자 태스크바 등)

```tsx
export function Desktop({ children, wallpaper, style }: DesktopProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: wallpaper, ...style }}>
      <WindowLayer />
      {children}
    </div>
  );
}
```

### WindowLayer

- `window-manager` 패키지의 열린 윈도우 목록을 렌더
- `useWindowManager()`로 윈도우 상태 구독

### shellFeature (부트스트랩)

```typescript
export function shellFeature(kernel: Kernel): void {
  kernel.spawn({
    name: 'shell',
    kind: 'system',
    parentPid: kernel.initProcess.pid,
    metadata: {
      displayName: 'Shell',
      version: '0.1.0',
      packageId: '@windeath44/shell',
    },
  });
}
```

## 사용 예시 (소비자 앱)

```tsx
import { Desktop } from '@windeath44/shell';

// 소비자가 자신만의 태스크바를 올림
function App() {
  return (
    <Desktop wallpaper="#1e1e2e">
      <MyTaskbar />
    </Desktop>
  );
}
```

## 테스트

| 파일 | 테스트 항목 |
|------|------------|
| `Desktop.test.tsx` | 렌더 시 전체 화면 스타일 확인 |
| `Desktop.test.tsx` | wallpaper prop 적용 확인 |
| `Desktop.test.tsx` | children 렌더 확인 |

## 의존성

- `@windeath44/react-kernel`
- `@windeath44/window-manager`
- `@windeath44/theme`
- peerDependencies: `react >=18`
