import { useCallback, useEffect, useRef, useState } from 'react';
import { useDragDropContext } from '../DragDropProvider';
import type { UseDroppableOptions, UseDroppableResult } from '../types';

export function useDroppable<T = unknown>(
  ref: React.RefObject<HTMLElement | null>,
  options: UseDroppableOptions<T>,
): UseDroppableResult {
  const { dragState, registerDroppable, unregisterDroppable } = useDragDropContext();
  const [isOver, setIsOver] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    registerDroppable(el, optionsRef.current as UseDroppableOptions);
    return () => unregisterDroppable(el);
  }, [ref, registerDroppable, unregisterDroppable]);

  // reset isOver when drag ends
  useEffect(() => {
    if (!dragState.active) setIsOver(false);
  }, [dragState.active]);

  const onPointerEnter = useCallback(() => {
    const { active } = dragState;
    if (!active) return;
    const { accept } = optionsRef.current;
    if (accept && !accept.includes(active.type)) return;
    setIsOver(true);
    optionsRef.current.onDragOver?.(active as never);
  }, [dragState]);

  const onPointerLeave = useCallback(() => {
    setIsOver(false);
    optionsRef.current.onDragLeave?.();
  }, []);

  return {
    droppableProps: { onPointerEnter, onPointerLeave },
    isOver,
  };
}
