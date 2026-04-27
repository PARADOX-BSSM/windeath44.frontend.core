import type { WindowState, WindowPosition, WindowSize, OpenWindowOptions } from './types';

let idCounter = 0;
function generateId(): string {
  return `win-${++idCounter}`;
}

export interface WindowStoreState {
  windows: Map<string, WindowState>;
  zCounter: number;
  children: Map<string, import('react').ReactNode>;
}

export interface WindowStore {
  getState(): WindowStoreState;
  open(options: OpenWindowOptions): string;
  close(id: string): void;
  minimize(id: string): void;
  maximize(id: string): void;
  restore(id: string): void;
  focus(id: string): void;
  move(id: string, position: WindowPosition): void;
  resize(id: string, size: WindowSize): void;
  subscribe(listener: () => void): () => void;
}

const DEFAULT_SIZE: WindowSize = { width: 480, height: 320 };
const DEFAULT_MIN_SIZE: WindowSize = { width: 200, height: 120 };

export function createWindowStore(): WindowStore {
  const state: WindowStoreState = {
    windows: new Map(),
    zCounter: 100,
    children: new Map(),
  };
  const listeners = new Set<() => void>();

  function notify() {
    for (const l of Array.from(listeners)) l();
  }

  function getWindow(id: string): WindowState {
    const w = state.windows.get(id);
    if (!w) throw new Error(`No window with id=${id}`);
    return w;
  }

  function update(id: string, patch: Partial<WindowState>): void {
    const w = getWindow(id);
    state.windows.set(id, { ...w, ...patch });
    notify();
  }

  return {
    getState: () => state,

    open(options: OpenWindowOptions): string {
      const id = generateId();
      state.zCounter++;
      const win: WindowState = {
        id,
        pid: options.pid,
        title: options.title,
        icon: options.icon,
        position: { x: 80 + (state.zCounter % 20) * 20, y: 60 + (state.zCounter % 10) * 20, ...options.initialPosition },
        size: { ...DEFAULT_SIZE, ...options.initialSize },
        minSize: { ...DEFAULT_MIN_SIZE, ...options.minSize },
        zIndex: state.zCounter,
        status: 'normal',
        resizable: options.resizable ?? true,
        closable: options.closable ?? true,
      };
      state.windows.set(id, win);
      state.children.set(id, options.children);
      notify();
      return id;
    },

    close(id: string): void {
      state.windows.delete(id);
      state.children.delete(id);
      notify();
    },

    minimize(id: string): void {
      update(id, { status: 'minimized' });
    },

    maximize(id: string): void {
      update(id, { status: 'maximized' });
    },

    restore(id: string): void {
      update(id, { status: 'normal' });
    },

    focus(id: string): void {
      state.zCounter++;
      update(id, { zIndex: state.zCounter });
    },

    move(id: string, position: WindowPosition): void {
      update(id, { position });
    },

    resize(id: string, size: WindowSize): void {
      const w = getWindow(id);
      update(id, {
        size: {
          width: Math.max(size.width, w.minSize.width),
          height: Math.max(size.height, w.minSize.height),
        },
      });
    },

    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
