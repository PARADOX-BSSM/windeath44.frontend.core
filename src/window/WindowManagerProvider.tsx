import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createWindowStore } from './WindowStore';
import type { WindowState, OpenWindowOptions, WindowPosition, WindowSize } from './types';

export interface WindowManagerContextValue {
  windows: WindowState[];
  getChildren(id: string): ReactNode;
  open(options: OpenWindowOptions): string;
  close(id: string): void;
  minimize(id: string): void;
  maximize(id: string): void;
  restore(id: string): void;
  focus(id: string): void;
  move(id: string, position: WindowPosition): void;
  resize(id: string, size: WindowSize): void;
}

const WindowManagerContext = createContext<WindowManagerContextValue | null>(null);

export function useWindowManager(): WindowManagerContextValue {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error('useWindowManager must be used inside <WindowManagerProvider>');
  return ctx;
}

export interface WindowManagerProviderProps {
  children: ReactNode;
}

export function WindowManagerProvider({ children }: WindowManagerProviderProps) {
  const store = useMemo(() => createWindowStore(), []);

  const [windows, setWindows] = useState<WindowState[]>(() =>
    Array.from(store.getState().windows.values()),
  );

  useEffect(() => {
    return store.subscribe(() => {
      setWindows(Array.from(store.getState().windows.values()));
    });
  }, [store]);

  const value: WindowManagerContextValue = useMemo(
    () => ({
      windows,
      getChildren: (id) => store.getState().children.get(id) ?? null,
      open: (opts) => store.open(opts),
      close: (id) => store.close(id),
      minimize: (id) => store.minimize(id),
      maximize: (id) => store.maximize(id),
      restore: (id) => store.restore(id),
      focus: (id) => store.focus(id),
      move: (id, pos) => store.move(id, pos),
      resize: (id, size) => store.resize(id, size),
    }),
    // windows 변경 시 value 재생성
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [windows, store],
  );

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
}

