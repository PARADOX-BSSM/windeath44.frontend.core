import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { HydrationPayload, SSRContextValue } from './types';
import { isBrowser } from './guards';
import { readStateFromWindow } from './serialize';

const SSRContext = createContext<SSRContextValue | null>(null);

export function useSSRContext(): SSRContextValue {
  const ctx = useContext(SSRContext);
  if (!ctx) throw new Error('useSSRContext must be used inside <SSRProvider>');
  return ctx;
}

const EMPTY_PAYLOAD: HydrationPayload = { version: 1 };

export interface SSRProviderProps {
  /** 서버에서 주입하는 초기 payload */
  payload?: HydrationPayload;
  children: ReactNode;
}

export function SSRProvider({ payload: serverPayload, children }: SSRProviderProps) {
  const initial: HydrationPayload = useMemo(() => {
    if (serverPayload) return serverPayload;
    if (isBrowser()) return readStateFromWindow() ?? EMPTY_PAYLOAD;
    return EMPTY_PAYLOAD;
  }, [serverPayload]);

  const [payload, setPayload] = useState<HydrationPayload>(initial);

  const mergePayload = useCallback((slice: Partial<HydrationPayload>) => {
    setPayload((prev) => ({ ...prev, ...slice }));
  }, []);

  const value: SSRContextValue = useMemo(
    () => ({ isServer: !isBrowser(), payload, mergePayload }),
    [payload, mergePayload],
  );

  return <SSRContext.Provider value={value}>{children}</SSRContext.Provider>;
}
