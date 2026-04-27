# PLAN: @windeath44/window-manager

## 목적

드래그·리사이즈·최소화·최대화가 가능한 윈도우 관리 시스템.
각 윈도우는 특정 프로세스(pid)에 귀속되며, 프로세스 kill 시 윈도우도 닫힌다.

## 디렉터리 구조

```
packages/window-manager/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts
    ├── types.ts
    ├── WindowStore.ts      # Zustand 스토어
    ├── WindowManager.ts    # 스토어 래퍼 (imperative API)
    ├── components/
    │   ├── Window.tsx
    │   ├── WindowChrome.tsx   # 타이틀바 + 컨트롤 버튼
    │   ├── WindowContent.tsx  # children 렌더 영역
    │   └── ResizeHandle.tsx   # 8방향 리사이즈 핸들
    ├── hooks/
    │   ├── useWindowManager.ts
    │   └── useWindow.ts
    └── __tests__/
        ├── WindowStore.test.ts
        └── Window.test.tsx
```

## TypeScript Interfaces

```typescript
export type WindowStatus = 'normal' | 'minimized' | 'maximized';

export interface WindowPosition { x: number; y: number; }
export interface WindowSize { width: number; height: number; }

export interface WindowState {
  id: string;            // nanoid
  pid: number;
  title: string;
  icon?: string;
  position: WindowPosition;
  size: WindowSize;
  minSize: WindowSize;
  zIndex: number;
  status: WindowStatus;
  resizable: boolean;
  closable: boolean;
}

export interface OpenWindowOptions {
  pid: number;
  title: string;
  icon?: string;
  initialPosition?: Partial<WindowPosition>;
  initialSize?: Partial<WindowSize>;
  minSize?: Partial<WindowSize>;
  resizable?: boolean;
  closable?: boolean;
  children: ReactNode;
}

export interface WindowManagerContextValue {
  windows: WindowState[];
  open(options: OpenWindowOptions): string;   // window id 반환
  close(id: string): void;
  minimize(id: string): void;
  maximize(id: string): void;
  restore(id: string): void;
  focus(id: string): void;
  move(id: string, position: WindowPosition): void;
  resize(id: string, size: WindowSize): void;
}
```

## 구현 상세

### WindowStore (Zustand)

- `windows: Map<string, WindowState>`
- `zCounter: number` — focus 시 증가하여 zIndex에 할당
- 불변 업데이트: `produce` 패턴 (immer 없이 spread)

### Window 컴포넌트

- `onMouseDown` on `WindowChrome` → 드래그 시작 (`pointerId` capture)
- `onPointerMove` on document → position 업데이트
- `onPointerUp` → 드래그 종료
- 뷰포트 경계 내로 clamp (음수 position 방지)

### ResizeHandle (8방향)

- `n`, `s`, `e`, `w`, `ne`, `nw`, `se`, `sw` 8개 핸들
- `cursor` CSS 자동 설정
- 최소 크기(`minSize`) 아래로 리사이즈 방지

### IPC 연동

```typescript
// 윈도우 열릴 때
bus.publish('window:open', pid, { pid, title });
// 닫힐 때
bus.publish('window:close', pid, { pid });
// 포커스 시
bus.publish('window:focus', pid, { pid });
```

### 프로세스 kill 시 자동 닫기

`useIPCSubscribe`로 `'process:killed'` 수신 → 해당 pid의 모든 윈도우 close

## 테스트

| 파일 | 테스트 항목 |
|------|------------|
| `WindowStore.test.ts` | open 후 windows 배열에 포함 |
| `WindowStore.test.ts` | close 후 제거 |
| `WindowStore.test.ts` | minimize/maximize/restore 상태 전이 |
| `WindowStore.test.ts` | focus 시 zIndex 최대값 할당 |
| `WindowStore.test.ts` | 동시 여러 윈도우 독립 관리 |
| `Window.test.tsx` | 드래그 후 position 변경 확인 |
| `Window.test.tsx` | 타이틀바 렌더링 확인 |

## 의존성

- `@windeath44/react-kernel`
- `@windeath44/theme`
- peerDependencies: `react >=18`
