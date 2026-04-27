# PLAN: @windeath44/drag-drop

## 목적

네이티브에 가까운 드래그 앤 드롭 경험. Pointer Events API 기반으로 구현하며,
파일·아이콘·윈도우·텍스트 등 다양한 페이로드 타입을 지원한다.

## 디렉터리 구조

```
packages/drag-drop/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts
    ├── types.ts
    ├── DragDropProvider.tsx
    ├── components/
    │   └── DragOverlay.tsx    # 드래그 중 커서 따라다니는 미리보기
    ├── hooks/
    │   ├── useDraggable.ts
    │   └── useDroppable.ts
    └── __tests__/
        ├── useDraggable.test.tsx
        └── useDroppable.test.tsx
```

## TypeScript Interfaces

```typescript
export type DragPayloadType = 'file' | 'icon' | 'window' | 'text' | 'custom';

export interface DragPayload<T = unknown> {
  type: DragPayloadType;
  data: T;
  preview?: ReactNode;   // DragOverlay에 렌더
}

export interface UseDraggableOptions<T> {
  payload: DragPayload<T>;
  disabled?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export interface UseDraggableResult {
  draggableProps: {
    onPointerDown: PointerEventHandler;
    style: CSSProperties;
  };
  isDragging: boolean;
}

export interface UseDroppableOptions<T> {
  accept?: DragPayloadType[];    // undefined = 모두 수락
  onDrop: (payload: DragPayload<T>) => void;
  onDragOver?: (payload: DragPayload<T>) => void;
  onDragLeave?: () => void;
}

export interface UseDroppableResult {
  droppableProps: {
    onPointerEnter: PointerEventHandler;
    onPointerLeave: PointerEventHandler;
  };
  isOver: boolean;
}
```

## 구현 상세

### DragDropProvider

- 전역 drag 상태: `{ active: DragPayload | null, position: { x, y } }`
- `onPointerMove` on document → position 업데이트 → DragOverlay 이동
- `onPointerUp` on document → 현재 droppable 위에 있으면 `onDrop` 호출

### useDraggable

- `onPointerDown` → `pointer capture` + 전역 상태에 payload 등록
- `onPointerUp` → capture 해제 + 전역 상태 초기화
- `touch-action: none` CSS 필수 (모바일 스크롤 방지)

### useDroppable

- `onPointerEnter/Leave`로 `isOver` 상태 관리
- `pointerup` 발생 시 `DragDropProvider`가 hit-test → `onDrop` 호출
- hit-test: `element.contains(document.elementFromPoint(x, y))`

### DragOverlay

- `position: fixed`, `pointer-events: none`
- 현재 drag 중인 payload의 `preview` ReactNode 렌더

## 테스트

| 파일 | 테스트 항목 |
|------|------------|
| `useDraggable.test.tsx` | pointerdown 후 isDragging=true |
| `useDraggable.test.tsx` | pointerup 후 isDragging=false |
| `useDroppable.test.tsx` | pointerenter 후 isOver=true |
| `useDroppable.test.tsx` | pointerup 시 onDrop 호출 확인 |
| `useDroppable.test.tsx` | accept 타입 불일치 시 onDrop 미호출 |

## 의존성

- peerDependencies: `react >=18`
