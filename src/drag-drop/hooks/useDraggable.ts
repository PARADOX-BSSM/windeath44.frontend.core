import { useCallback, useRef, useState } from 'react';
import { useDragDropContext } from '../DragDropProvider';
import type { UseDraggableOptions, UseDraggableResult } from '../types';

export function useDraggable<T = unknown>(options: UseDraggableOptions<T>): UseDraggableResult {
  const { startDrag, endDrag } = useDragDropContext();
  const [isDragging, setIsDragging] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (optionsRef.current.disabled) return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      setIsDragging(true);
      optionsRef.current.onDragStart?.();
      startDrag(optionsRef.current.payload as never, e.clientX, e.clientY);

      const el = e.currentTarget;
      function onUp() {
        el.releasePointerCapture?.(e.pointerId);
        setIsDragging(false);
        optionsRef.current.onDragEnd?.();
        endDrag();
        el.removeEventListener('pointerup', onUp);
      }
      el.addEventListener('pointerup', onUp);
    },
    [startDrag, endDrag],
  );

  return {
    draggableProps: {
      onPointerDown,
      style: { touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab' },
    },
    isDragging,
  };
}
