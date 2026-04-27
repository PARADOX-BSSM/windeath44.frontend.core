import type { CSSProperties, PointerEventHandler, ReactNode } from 'react';

export type DragPayloadType = 'file' | 'icon' | 'window' | 'text' | 'custom';

export interface DragPayload<T = unknown> {
  type: DragPayloadType;
  data: T;
  /** DragOverlay에 렌더할 미리보기 */
  preview?: ReactNode;
}

export interface UseDraggableOptions<T = unknown> {
  payload: DragPayload<T>;
  disabled?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export interface UseDraggableResult {
  draggableProps: {
    onPointerDown: PointerEventHandler<HTMLElement>;
    style: CSSProperties;
  };
  isDragging: boolean;
}

export interface UseDroppableOptions<T = unknown> {
  /** undefined = 모든 타입 수락 */
  accept?: DragPayloadType[];
  onDrop: (payload: DragPayload<T>) => void;
  onDragOver?: (payload: DragPayload<T>) => void;
  onDragLeave?: () => void;
}

export interface UseDroppableResult {
  droppableProps: {
    onPointerEnter: PointerEventHandler<HTMLElement>;
    onPointerLeave: PointerEventHandler<HTMLElement>;
  };
  isOver: boolean;
}

export interface DragState {
  active: DragPayload | null;
  position: { x: number; y: number };
}

export interface DragDropContextValue {
  dragState: DragState;
  startDrag(payload: DragPayload, x: number, y: number): void;
  endDrag(): void;
  registerDroppable(el: HTMLElement, options: UseDroppableOptions): void;
  unregisterDroppable(el: HTMLElement): void;
}
