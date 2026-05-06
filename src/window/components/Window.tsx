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

function getDisplayScale(): { scaleX: number; scaleY: number } {
  const el = document.querySelector('[data-windeath44-display]');
  if (!el) return { scaleX: 1, scaleY: 1 };
  const vw = parseFloat(getComputedStyle(el).getPropertyValue('--vw')) || 1;
  const vh = parseFloat(getComputedStyle(el).getPropertyValue('--vh')) || 1;
  return { scaleX: vw, scaleY: vh };
}

export function Window({ window: win }: WindowProps) {
  const { getChildren, close, minimize, maximize, restore, focus, move, resize } =
    useWindowManager();

  const containerRef = useRef<HTMLDivElement>(null);

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

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || dragging.current || resizing.current) return;
    if (win.status === 'normal') {
      el.style.transform = `translate(calc(${win.position.x} * var(--vw)), calc(${win.position.y} * var(--vh)))`;
      el.style.width = `calc(${win.size.width} * var(--vw))`;
      el.style.height = `calc(${win.size.height} * var(--vh))`;
    }
  });

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

      const { scaleX, scaleY } = getDisplayScale();

      const display = document.querySelector('[data-windeath44-display]') as HTMLElement;
      let maxDesignX = Infinity;
      let maxDesignY = Infinity;

      if (display) {
        const rect = display.getBoundingClientRect();
        maxDesignX = (rect.width - win.size.width * scaleX) / scaleX;
        maxDesignY = (rect.height - win.size.height * scaleY) / scaleY;
      }

      const rawX = d.originX + (e.clientX - d.startX) / scaleX;
      const rawY = d.originY + (e.clientY - d.startY) / scaleY;

      const x = Math.max(0, Math.min(rawX, maxDesignX));
      const y = Math.max(0, Math.min(rawY, maxDesignY));

      d.x = x;
      d.y = y;
      containerRef.current.style.transform = `translate(calc(${x} * var(--vw)), calc(${y} * var(--vh)))`;
    },
    [win.size.width, win.size.height],
  );

  const onTitlebarPointerUp = useCallback(() => {
    const d = dragging.current;
    if (d) move(win.id, { x: d.x, y: d.y });
    dragging.current = null;
  }, [win.id, move]);

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

      const { scaleX, scaleY } = getDisplayScale();
      const dx = (e.clientX - r.startX) / scaleX;
      const dy = (e.clientY - r.startY) / scaleY;

      let w = r.originW, h = r.originH, x = r.originX, y = r.originY;

      if (r.edge.includes('e')) w += dx;
      if (r.edge.includes('s')) h += dy;
      if (r.edge.includes('w')) { w -= dx; x = Math.max(0, r.originX + dx); }
      if (r.edge.includes('n')) { h -= dy; y = Math.max(0, r.originY + dy); }
      w = Math.max(MIN_W, w);
      h = Math.max(MIN_H, h);

      r.x = x; r.y = y; r.w = w; r.h = h;
      containerRef.current.style.transform = `translate(calc(${x} * var(--vw)), calc(${y} * var(--vh)))`;
      containerRef.current.style.width = `calc(${w} * var(--vw))`;
      containerRef.current.style.height = `calc(${h} * var(--vh))`;
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

  const containerStyle: CSSProperties =
    win.status === 'maximized'
      ? { position: 'fixed', inset: 0, zIndex: win.zIndex, width: '100vw', height: '100vh' }
      : win.status === 'minimized'
      ? { display: 'none' }
      : {
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: win.zIndex,
          boxSizing: 'border-box',
          willChange: 'transform',
        };

  const children = getChildren(win.id);

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      onPointerDown={(e) => { e.stopPropagation(); focus(win.id); }}
      data-window-id={win.id}
      data-window-minimized={win.status === 'minimized' ? '' : undefined}
    >
      <div
        data-testid={`window-chrome-${win.id}`}
        style={{ cursor: 'move', userSelect: 'none', display: 'flex', alignItems: 'center' }}
        onPointerDown={onTitlebarPointerDown}
        onPointerMove={onTitlebarPointerMove}
        onPointerUp={onTitlebarPointerUp}
      >
        {win.icon && <img src={win.icon} alt="" style={{ width: 16, height: 16, marginRight: 6 }} />}
        <span style={{ flex: 1 }}>{win.title}</span>
        <button className="window-btn window-btn-minimize" aria-label="minimize" onPointerDown={(e) => e.stopPropagation()} onClick={() => minimize(win.id)}>
          <img src="/assets/system/min.svg" alt="" draggable={false} style={{ width: '100%', height: '100%' }} />
        </button>
        <button className="window-btn window-btn-maximize" aria-label="maximize/restore" onPointerDown={(e) => e.stopPropagation()} onClick={() => win.status === 'maximized' ? restore(win.id) : maximize(win.id)}>
          <img src="/assets/system/full.svg" alt="" draggable={false} style={{ width: '100%', height: '100%' }} />
        </button>
        {win.closable && (
          <button className="window-btn window-btn-close" aria-label="close" onPointerDown={(e) => e.stopPropagation()} onClick={() => close(win.id)}>
            <img src="/assets/system/exit.svg" alt="" draggable={false} style={{ width: '100%', height: '100%' }} />
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>

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
