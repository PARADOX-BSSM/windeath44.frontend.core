import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { DragDropContextValue, DragPayload, DragState, UseDroppableOptions } from './types';

const DragDropContext = createContext<DragDropContextValue | null>(null);

export function useDragDropContext(): DragDropContextValue {
  const ctx = useContext(DragDropContext);
  if (!ctx) throw new Error('useDragDropContext must be used inside <DragDropProvider>');
  return ctx;
}

export interface DragDropProviderProps {
  children: ReactNode;
}

export function DragDropProvider({ children }: DragDropProviderProps) {
  const [dragState, setDragState] = useState<DragState>({ active: null, position: { x: 0, y: 0 } });
  const droppables = useRef<Map<HTMLElement, UseDroppableOptions>>(new Map());
  const activeRef = useRef<DragPayload | null>(null);

  const startDrag = useCallback((payload: DragPayload, x: number, y: number) => {
    activeRef.current = payload;
    setDragState({ active: payload, position: { x, y } });
  }, []);

  const endDrag = useCallback(() => {
    activeRef.current = null;
    setDragState({ active: null, position: { x: 0, y: 0 } });
  }, []);

  const registerDroppable = useCallback((el: HTMLElement, options: UseDroppableOptions) => {
    droppables.current.set(el, options);
  }, []);

  const unregisterDroppable = useCallback((el: HTMLElement) => {
    droppables.current.delete(el);
  }, []);

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      if (!activeRef.current) return;
      setDragState((prev) => ({ ...prev, position: { x: e.clientX, y: e.clientY } }));
    }

    function onPointerUp(e: PointerEvent) {
      const payload = activeRef.current;
      if (!payload) return;

      const target = document.elementFromPoint?.(e.clientX, e.clientY) ?? null;
      droppables.current.forEach((opts, el) => {
        if (!target || !el.contains(target)) return;
        if (opts.accept && !opts.accept.includes(payload.type)) return;
        opts.onDrop(payload);
      });

      endDrag();
    }

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };
  }, [endDrag]);

  return (
    <DragDropContext.Provider value={{ dragState, startDrag, endDrag, registerDroppable, unregisterDroppable }}>
      {children}
      {dragState.active?.preview && (
        <div
          data-windeath44-drag-overlay
          style={{
            position: 'fixed',
            left: dragState.position.x,
            top: dragState.position.y,
            pointerEvents: 'none',
            zIndex: 99999,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {dragState.active.preview}
        </div>
      )}
    </DragDropContext.Provider>
  );
}
