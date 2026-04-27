import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ScaleContextValue } from './types';

const ScaleContext = createContext<ScaleContextValue | null>(null);

export function useScale(): ScaleContextValue {
  const ctx = useContext(ScaleContext);
  if (!ctx) throw new Error('useScale must be used inside <ScaleProvider>');
  return ctx;
}

function getDeviceScale(): number {
  return typeof window !== 'undefined' ? window.devicePixelRatio : 1;
}

export interface ScaleProviderProps {
  children: ReactNode;
}

export function ScaleProvider({ children }: ScaleProviderProps) {
  const [scale, setScaleState] = useState<number>(getDeviceScale);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const handler = () => setScaleState(getDeviceScale());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setScale = useCallback((value: number) => {
    setScaleState(value);
  }, []);

  const resetScale = useCallback(() => {
    setScaleState(getDeviceScale());
  }, []);

  return (
    <ScaleContext.Provider value={{ scale, setScale, resetScale }}>
      {children}
    </ScaleContext.Provider>
  );
}
