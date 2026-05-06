import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createWindowStore } from './WindowStore';
import type { WindowState, OpenWindowOptions, WindowPosition, WindowSize } from './types';
import type { NavStackEntry } from './AppNavStack';

export interface WindowManagerContextValue {
  windows: WindowState[];
  focusedId: string | null;
  getChildren(id: string): ReactNode;
  open(options: OpenWindowOptions): string;
  close(id: string): void;
  minimize(id: string): void;
  maximize(id: string): void;
  restore(id: string): void;
  focus(id: string): void;
  blur(): void;
  move(id: string, position: WindowPosition): void;
  resize(id: string, size: WindowSize): void;
  navigate(id: string, entry: NavStackEntry): void;
  goBack(id: string): string | null;
  goForward(id: string): string | null;
}

const WindowManagerContext = createContext<WindowManagerContextValue | null>(null);

export function useWindowManager(): WindowManagerContextValue {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error('useWindowManager must be used inside <WindowManagerProvider>');
  return ctx;
}

export interface WindowManagerProviderProps {
  onNavigate?: (path: string) => void;
  children: ReactNode;
}

export function WindowManagerProvider({ onNavigate, children }: WindowManagerProviderProps) {
  const store = useMemo(() => createWindowStore(), []);

  useEffect(() => {
    if (onNavigate) {
      store.setOnNavigate(onNavigate);
    }
  }, [store, onNavigate]);

  const [windows, setWindows] = useState<WindowState[]>(() =>
    Array.from(store.getState().windows.values()),
  );

  const [focusedId, setFocusedId] = useState<string | null>(() =>
    store.getState().focusedId,
  );

  useEffect(() => {
    return store.subscribe(() => {
      setWindows(Array.from(store.getState().windows.values()));
      setFocusedId(store.getState().focusedId);
    });
  }, [store]);

  const value: WindowManagerContextValue = useMemo(
    () => ({
      windows,
      focusedId,
      getChildren: (id) => store.getState().children.get(id) ?? null,
      open: (opts) => store.open(opts),
      close: (id) => store.close(id),
      minimize: (id) => store.minimize(id),
      maximize: (id) => store.maximize(id),
      restore: (id) => store.restore(id),
      focus: (id) => store.focus(id),
      blur: () => store.blur(),
      move: (id, pos) => store.move(id, pos),
      resize: (id, size) => store.resize(id, size),
      navigate: (id, entry) => store.navigate(id, entry),
      goBack: (id) => store.goBack(id),
      goForward: (id) => store.goForward(id),
    }),
    [windows, focusedId, store],
  );

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
}

