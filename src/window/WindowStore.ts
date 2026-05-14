import type { WindowState, WindowPosition, WindowSize, OpenWindowOptions } from './types';
import { AppNavStack, type NavStackEntry } from './AppNavStack';

let idCounter = 0;
function generateId(): string {
  return `win-${++idCounter}`;
}

export interface WindowStoreState {
  windows: Map<string, WindowState>;
  zCounter: number;
  children: Map<string, import('react').ReactNode>;
  navStacks: Map<string, AppNavStack>;
  focusedId: string | null;
  onNavigate: ((path: string) => void) | null;
}

export interface WindowStore {
  getState(): WindowStoreState;
  open(options: OpenWindowOptions): string;
  close(id: string): void;
  minimize(id: string): void;
  maximize(id: string): void;
  restore(id: string): void;
  focus(id: string): void;
  blur(): void;
  move(id: string, position: WindowPosition): void;
  resize(id: string, size: WindowSize): void;
  findByPackageId(packageId: string): WindowState | undefined;
  navigate(id: string, entry: NavStackEntry): void;
  goBack(id: string): string | null;
  goForward(id: string): string | null;
  subscribe(listener: () => void): () => void;
  setOnNavigate(fn: (path: string) => void): void;
}

const DEFAULT_SIZE: WindowSize = { width: 480, height: 320 };
const DEFAULT_MIN_SIZE: WindowSize = { width: 200, height: 120 };

export function createWindowStore(): WindowStore {
  const state: WindowStoreState = {
    windows: new Map(),
    zCounter: 100,
    children: new Map(),
    navStacks: new Map(),
    focusedId: null,
    onNavigate: null,
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
        packageId: options.packageId,
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
      state.navStacks.set(id, new AppNavStack());
      state.focusedId = id;
      notify();
      return id;
    },

    close(id: string): void {
      state.windows.delete(id);
      state.children.delete(id);
      state.navStacks.delete(id);
      if (state.focusedId === id) {
        state.focusedId = null;
      }
      notify();
    },

    minimize(id: string): void {
      update(id, { status: 'minimized' });
    },

    maximize(id: string): void {
      update(id, { status: 'maximized' });
    },

    restore(id: string): void {
      state.zCounter++;
      const w = getWindow(id);
      state.windows.set(id, { ...w, status: 'normal', zIndex: state.zCounter });
      state.focusedId = id;
      notify();
    },

    focus(id: string): void {
      state.zCounter++;
      const w = getWindow(id);
      state.windows.set(id, { ...w, zIndex: state.zCounter });
      state.focusedId = id;
      notify();
      const navStack = state.navStacks.get(id);
      if (navStack?.current && state.onNavigate) {
        state.onNavigate(navStack.current.path);
      }
    },

    blur(): void {
      state.focusedId = null;
      notify();
    },

    findByPackageId(packageId: string): WindowState | undefined {
      for (const w of state.windows.values()) {
        if (w.packageId === packageId) return w;
      }
      return undefined;
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

    navigate(id: string, entry: NavStackEntry): void {
      const navStack = state.navStacks.get(id);
      if (!navStack) return;
      navStack.push(entry);
      if (state.focusedId === id && state.onNavigate) {
        state.onNavigate(entry.path);
      }
    },

    goBack(id: string): string | null {
      const navStack = state.navStacks.get(id);
      if (!navStack) return null;
      const entry = navStack.back();
      if (entry && state.focusedId === id && state.onNavigate) {
        state.onNavigate(entry.path);
      }
      return entry?.path ?? null;
    },

    goForward(id: string): string | null {
      const navStack = state.navStacks.get(id);
      if (!navStack) return null;
      const entry = navStack.forward();
      if (entry && state.focusedId === id && state.onNavigate) {
        state.onNavigate(entry.path);
      }
      return entry?.path ?? null;
    },

    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    setOnNavigate(fn: (path: string) => void): void {
      state.onNavigate = fn;
    },
  };
}
