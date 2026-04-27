import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { KeybindingRegistration, KeymapContextValue } from './types';
import { matchesCombo } from './parseShortcut';

const KeymapContext = createContext<KeymapContextValue | null>(null);

export function useKeymap(): KeymapContextValue {
  const ctx = useContext(KeymapContext);
  if (!ctx) throw new Error('useKeymap must be used inside <KeymapProvider>');
  return ctx;
}

export interface KeymapProviderProps {
  children: ReactNode;
}

export function KeymapProvider({ children }: KeymapProviderProps) {
  const bindingsRef = useRef<KeybindingRegistration[]>([]);

  const register = useCallback((reg: KeybindingRegistration): (() => void) => {
    const existing = bindingsRef.current.find(
      (b) =>
        b.combo.key === reg.combo.key &&
        b.combo.ctrl === reg.combo.ctrl &&
        b.combo.shift === reg.combo.shift &&
        b.combo.alt === reg.combo.alt &&
        b.combo.meta === reg.combo.meta &&
        b.pid === reg.pid,
    );
    if (existing) {
      console.warn(`[keyboard] Shortcut conflict: "${reg.id}" overrides "${existing.id}"`);
    }
    bindingsRef.current = [...bindingsRef.current, reg];
    return () => {
      bindingsRef.current = bindingsRef.current.filter((b) => b !== reg);
    };
  }, []);

  const getBindings = useCallback(() => [...bindingsRef.current], []);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    function handleKeyDown(e: KeyboardEvent) {
      for (const reg of [...bindingsRef.current].reverse()) {
        if (matchesCombo(e, reg.combo)) {
          reg.handler(e);
          break;
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <KeymapContext.Provider value={{ register, getBindings }}>
      {children}
    </KeymapContext.Provider>
  );
}
