import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { ClipboardContextValue, ClipboardData } from './types';

const ClipboardContext = createContext<ClipboardContextValue | null>(null);

export function useClipboard(): ClipboardContextValue {
  const ctx = useContext(ClipboardContext);
  if (!ctx) throw new Error('useClipboard must be used inside <ClipboardProvider>');
  return ctx;
}

export interface ClipboardProviderProps {
  children: ReactNode;
}

export function ClipboardProvider({ children }: ClipboardProviderProps) {
  const [data, setData] = useState<ClipboardData | null>(null);

  const write = useCallback((d: ClipboardData) => setData(d), []);
  const read = useCallback(() => data, [data]);
  const clear = useCallback(() => setData(null), []);

  const writeToSystem = useCallback(async (text: string): Promise<void> => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(text);
  }, []);

  const readFromSystem = useCallback(async (): Promise<string | null> => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return null;
    try {
      return await navigator.clipboard.readText();
    } catch {
      return null;
    }
  }, []);

  return (
    <ClipboardContext.Provider value={{ data, write, read, clear, writeToSystem, readFromSystem }}>
      {children}
    </ClipboardContext.Provider>
  );
}
