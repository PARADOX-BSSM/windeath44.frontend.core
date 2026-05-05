import {
  useRef,
  useLayoutEffect,
  useCallback,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type { WindowState } from '../types';
import { useWindowManager } from '../WindowManagerProvider';

interface WindowProps {
  window: WindowState;
}

// ── Resize edge helpers ──────────────────────────────────────────────────────

type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
const RESIZE_EDGES: ResizeEdge[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
const HANDLE = 6;
const MIN_W = 200;
const MIN_H = 100;

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
  return { ...base, ...pos, cursor: cursors[edge] };
}

// ── Component ────────────────────────────────────────────────────────────────

export function Window({ window: win }: WindowProps) {
  const { getChildren, close, minimize, maximize, restore, focus, move, resize } =
    useWindowManager();

  const containerRef = useRef<HTMLDivElement>(null);

  // Drag state — stored in ref so mutations never trigger re-renders
  const dragging = useRef<{
    startX: number; startY: number;
    originX: number; originY: number;
    x: number; y: number;
  } | null>(null);

  const resizing = useRef<{
    edge: ResizeEdge;
    startX: number; startY: number;
    originW: number; originH: number;
    originX: number; originY: number;
    x: number; y: number; w: number; h: number;
  } | null>(null);

  // Sync React state → DOM only when idle (not during drag/resize).
  // This keeps the window in place across re-renders without a full layout pass.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || dragging.current || resizing.current) return;
    if (win.status === 'normal') {
      el.style.transform = `translate(${win.position.x}px, ${win.position.y}px)`;
      el.style.width = `${win.size.width}px`;
      el.style.height = `${win.size.height}px`;
    }
  });

  // ── Drag (titlebar) ────────────────────────────────────────────────────────

  const onTitlebarPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (win.status === 'maximized') return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragging.current = {
        startX: e.clientX, startY: e.clientY,
        originX: win.position.x, originY: win.position.y,
        x: win.position.x, y: win.position.y,
      };
      focus(win.id);
    },
    [win.id, win.position, win.status, focus],
  );

  const onTitlebarPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const d = dragging.current;
      if (!d || !containerRef.current) return;
      // Direct DOM write — zero React involvement, instant response
      const x = Math.max(0, d.originX + e.clientX - d.startX);
      const y = Math.max(0, d.originY + e.clientY - d.startY);
      d.x = x;
      d.y = y;
      containerRef.current.style.transform = `translate(${x}px, ${y}px)`;
    },
    [],
  );

  const onTitlebarPointerUp = useCallback(() => {
    const d = dragging.current;
    if (d) move(win.id, { x: d.x, y: d.y }); // persist final position to state once
    dragging.current = null;
  }, [win.id, move]);

  // ── Resize ─────────────────────────────────────────────────────────────────

  const onResizePointerDown = useCallback(
    (edge: ResizeEdge) => (e: ReactPointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      resizing.current = {
        edge,
        startX: e.clientX, startY: e.clientY,
        originW: win.size.width, originH: win.size.height,
        originX: win.position.x, originY: win.position.y,
        x: win.position.x, y: win.position.y,
        w: win.size.width, h: win.size.height,
      };
      focus(win.id);
    },
    [win, focus],
  );

  const onResizePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const r = resizing.current;
      if (!r || !containerRef.current) return;
      const dx = e.clientX - r.startX;
      const dy = e.clientY - r.startY;
      let w = r.originW, h = r.originH, x = r.originX, y = r.originY;

      if (r.edge.includes('e')) w += dx;
      if (r.edge.includes('s')) h += dy;
      if (r.edge.includes('w')) { w -= dx; x = Math.max(0, r.originX + dx); }
      if (r.edge.includes('n')) { h -= dy; y = Math.max(0, r.originY + dy); }
      w = Math.max(MIN_W, w);
      h = Math.max(MIN_H, h);

      r.x = x; r.y = y; r.w = w; r.h = h;
      // Direct DOM write for instant feedback
      containerRef.current.style.transform = `translate(${x}px, ${y}px)`;
      containerRef.current.style.width = `${w}px`;
      containerRef.current.style.height = `${h}px`;
    },
    [],
  );

  const onResizePointerUp = useCallback(() => {
    const r = resizing.current;
    if (r) {
      resize(win.id, { width: r.w, height: r.h });
      move(win.id, { x: r.x, y: r.y });
    }
    resizing.current = null;
  }, [win.id, move, resize]);

  // ── Style ──────────────────────────────────────────────────────────────────

  const containerStyle: CSSProperties =
    win.status === 'maximized'
      ? { position: 'fixed', inset: 0, zIndex: win.zIndex }
      : win.status === 'minimized'
      ? { display: 'none' }
      : {
          // position only — size & transform managed by useLayoutEffect + direct DOM
          position: 'fixed',
          left: 0,
          top: 0,
          width: win.size.width,
          height: win.size.height,
          transform: `translate(${win.position.x}px, ${win.position.y}px)`,
          zIndex: win.zIndex,
          boxSizing: 'border-box',
          willChange: 'transform',
        };

  const children = getChildren(win.id);

  return (
    <div
      ref={containerRef}
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
