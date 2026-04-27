# windeath44.core/drag-drop

Pointer Events 기반 드래그 앤 드롭. 파일·아이콘·텍스트 등 타입화된 페이로드, DragOverlay 미리보기 지원.

## Import

```typescript
import { DragDropProvider, useDraggable, useDroppable } from 'windeath44.core/drag-drop';
```

## 기본 사용법

```tsx
import { DragDropProvider, useDraggable, useDroppable } from 'windeath44.core/drag-drop';

function App() {
  return (
    <DragDropProvider>
      <FileIcon />
      <FolderZone />
    </DragDropProvider>
  );
}

function FileIcon() {
  const { draggableProps, isDragging } = useDraggable({
    payload: { type: 'file', data: { name: 'report.pdf' } },
  });
  return (
    <div {...draggableProps} style={{ ...draggableProps.style, opacity: isDragging ? 0.5 : 1 }}>
      📄 report.pdf
    </div>
  );
}

function FolderZone() {
  const ref = useRef<HTMLDivElement>(null);
  const { droppableProps, isOver } = useDroppable(ref, {
    accept: ['file'],
    onDrop: (payload) => console.log('dropped', payload.data),
  });
  return (
    <div ref={ref} {...droppableProps} style={{ background: isOver ? '#444' : '#222' }}>
      📁 폴더
    </div>
  );
}
```

## useDraggable

```typescript
const { draggableProps, isDragging } = useDraggable({
  payload: { type, data, preview? },
  disabled?,
  onDragStart?,
  onDragEnd?,
});
```

`draggableProps`를 드래그 대상 요소에 spread한다. `touch-action: none` 포함.

## useDroppable

```typescript
const { droppableProps, isOver } = useDroppable(ref, {
  accept?,   // DragPayloadType[] — undefined이면 모두 수락
  onDrop,
  onDragOver?,
  onDragLeave?,
});
```

`ref`는 드롭 영역 DOM 요소. `droppableProps`를 spread한다.

## DragPayloadType

```typescript
type DragPayloadType = 'file' | 'icon' | 'window' | 'text' | 'custom';
```

## DragOverlay

드래그 중인 payload에 `preview` ReactNode가 있으면 커서를 따라다니는 오버레이로 자동 렌더.

```typescript
useDraggable({
  payload: {
    type: 'file',
    data: file,
    preview: <div>📄 {file.name}</div>,
  },
});
```

## 주의

- Pointer Events 기반 — `touch-action: none` 필수 (자동 적용됨)
- jsdom에서 hit-test(`elementFromPoint`) 동작하지 않으므로 E2E 테스트 필요

## Tests

```
src/drag-drop/DragDropTest/
└── useDraggable.test.tsx  — 9 tests (draggable 5, droppable 4)
```
