import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { IFileSystemAdapter } from './types';
import { MemoryAdapter } from './adapters/MemoryAdapter';
import { resolve } from './path';

export interface FSContextValue {
  adapter: IFileSystemAdapter;
  cwd: string;
  setCwd(path: string): void;
  resolvePath(p: string): string;
}

const FSContext = createContext<FSContextValue | null>(null);

export function useFS(): FSContextValue {
  const ctx = useContext(FSContext);
  if (!ctx) throw new Error('useFS must be used inside <VFSProvider>');
  return ctx;
}

export interface VFSProviderProps {
  adapter?: IFileSystemAdapter;
  initialCwd?: string;
  children: ReactNode;
}

export function VFSProvider({ adapter, initialCwd = '/', children }: VFSProviderProps) {
  const resolvedAdapter = useMemo(() => adapter ?? new MemoryAdapter(), [adapter]);
  const [cwd, setCwd] = useState(initialCwd);

  const value: FSContextValue = useMemo(
    () => ({
      adapter: resolvedAdapter,
      cwd,
      setCwd,
      resolvePath: (p: string) => (p.startsWith('/') ? p : resolve(cwd, p)),
    }),
    [resolvedAdapter, cwd],
  );

  return <FSContext.Provider value={value}>{children}</FSContext.Provider>;
}
