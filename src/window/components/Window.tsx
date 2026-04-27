import {
  useRef,
  useCallback,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type { WindowState } from '../types';
import { useWindowManager } from '../WindowManagerProvider';

interface WindowProps {
  window: WindowState;
}

export function Window({ window: win }: WindowProps) {
  const { getChildren, close, minimize, maximize, restore, focus, move, resize } =
    useWindowManager();

  const dragging = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const resizing = useRef<{
    edge: ResizeEdge;
    startX: number; startY: number;
    originW: number; originH: number;
    originX: number; originY: number;
  } | null>(null);

  // ── Drag (titlebar) ────────────────────────────────────────────────────────

  const onTitlebarPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (win.status === 'maximized') return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragging.current = {
        startX: e.clientX,
        startY: e.clientY,
        originX: win.position.x,
        originY: win.position.y,
      };
      focus(win.id);
    },
    [win.id, win.position, win.status, focus],
  );

  const onTitlebarPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      const dx = e.clientX - dragging.current.startX;
      const dy = e.clientY - dragging.current.startY;
      move(win.id, {
        x: Math.max(0, dragging.current.originX + dx),
        y: Math.max(0, dragging.current.originY + dy),
      });
    },
    [win.id, move],
  );

  const onTitlebarPointerUp = useCallback(() => {
    dragging.current = null;
  }, []);

  // ── Resize ─────────────────────────────────────────────────────────────────

  const onResizePointerDown = useCallback(
    (edge: ResizeEdge) => (e: ReactPointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      resizing.current = {
        edge,
        startX: e.clientX,
        startY: e.clientY,
        originW: win.size.width,
        originH: win.size.height,
        originX: win.position.x,
        originY: win.position.y,
      };
      focus(win.id);
    },
    [win, focus],
  );

  const onResizePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const r = resizing.current;
      if (!r) return;
      const dx = e.clientX - r.startX;
      const dy = e.clientY - r.startY;
      let { originW: w, originH: h, originX: x, originY: y } = r;

      if (r.edge.includes('e')) w += dx;
      if (r.edge.includes('s')) h += dy;
      if (r.edge.includes('w')) { w -= dx; x += dx; }
      if (r.edge.includes('n')) { h -= dy; y += dy; }

      resize(win.id, { width: w, height: h });
      if (r.edge.includes('w') || r.edge.includes('n')) {
        move(win.id, { x: Math.max(0, x), y: Math.max(0, y) });
      }
    },
    [win.id, move, resize],
  );

  const onResizePointerUp = useCallback(() => {
    resizing.current = null;
  }, []);

  // ── Style ──────────────────────────────────────────────────────────────────

  const containerStyle: CSSProperties =
    win.status === 'maximized'
      ? { position: 'fixed', inset: 0, zIndex: win.zIndex }
      : win.status === 'minimized'
      ? { display: 'none' }
      : {
          position: 'fixed',
          left: win.position.x,
          top: win.position.y,
          width: win.size.width,
          height: win.size.height,
          zIndex: win.zIndex,
          boxSizing: 'border-box',
        };

  const children = getChildren(win.id);

  return (
    <div
      style={containerStyle}
      onPointerDown={() => focus(win.id)}
      data-window-id={win.id}
    >
      {/* Titlebar */}
      <div
        data-testid={`window-chrome-${win.id}`}
        style={{ cursor: 'move', userSelect: 'none', display: 'flex', alignItems: 'center' }}
        onPointerDown={onTitlebarPointerDown}
        onPointerMove={onTitlebarPointerMove}
        onPointerUp={onTitlebarPointerUp}
      >
        {win.icon && <img src={win.icon} alt="" style={{ width: 16, height: 16, marginRight: 6 }} />}
        <span style={{ flex: 1 }}>{win.title}</span>
        <button aria-label="minimize" onPointerDown={(e) => e.stopPropagation()} onClick={() => minimize(win.id)}>–</button>
        <button aria-label="maximize/restore" onPointerDown={(e) => e.stopPropagation()} onClick={() => win.status === 'maximized' ? restore(win.id) : maximize(win.id)}>
          {win.status === 'maximized' ? '❐' : '□'}
        </button>
        {win.closable && <button aria-label="close" onPointerDown={(e) => e.stopPropagation()} onClick={() => close(win.id)}>✕</button>}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>

      {/* Resize handles */}
      {win.resizable && win.status === 'normal' && (
        <>
          {RESIZE_EDGES.map((edge) => (
            <div
              key={edge}
              data-resize={edge}
              style={resizeHandleStyle(edge)}
              onPointerDown={onResizePointerDown(edge)}
              onPointerMove={onResizePointerMove}
              onPointerUp={onResizePointerUp}
            />
          ))}
        </>
      )}
    </div>
  );
}

// ── Resize edge helpers ──────────────────────────────────────────────────────

type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
const RESIZE_EDGES: ResizeEdge[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
const HANDLE = 6;

function resizeHandleStyle(edge: ResizeEdge): CSSProperties {
  const base: CSSProperties = { position: 'absolute', zIndex: 1 };
  const cursors: Record<ResizeEdge, string> = {
    n: 'n-resize', s: 's-resize', e: 'e-resize', w: 'w-resize',
    ne: 'ne-resize', nw: 'nw-resize', se: 'se-resize', sw: 'sw-resize',
  };
  const pos: Partial<CSSProperties> = {};
  if (edge.includes('n')) { pos.top = 0; pos.height = HANDLE; }
  if (edge.includes('s')) { pos.bottom = 0; pos.height = HANDLE; }
  if (edge.includes('e')) { pos.right = 0; pos.width = HANDLE; }
  if (edge.includes('w')) { pos.left = 0; pos.width = HANDLE; }
  if (edge === 'n' || edge === 's') { pos.left = HANDLE; pos.right = HANDLE; }
  if (edge === 'e' || edge === 'w') { pos.top = HANDLE; pos.bottom = HANDLE; }
  if (edge.length === 1) {
    if (edge === 'n' || edge === 's') pos.height = HANDLE;
    if (edge === 'e' || edge === 'w') pos.width = HANDLE;
  }
  return { ...base, ...pos, cursor: cursors[edge] };
}
