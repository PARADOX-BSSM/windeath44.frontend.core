import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ThemeContextValue, ThemeId, ThemeTokens } from './types';
import { applyTokensToElement } from './tokens';
import { lightTokens } from './themes/light';
import { darkTokens } from './themes/dark';
import { catppuccinTokens } from './themes/catppuccin';

const builtinThemes: Record<string, ThemeTokens> = {
  light: lightTokens,
  dark: darkTokens,
  catppuccin: catppuccinTokens,
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

export interface ThemeProviderProps {
  defaultTheme?: ThemeId;
  children: ReactNode;
}

export function ThemeProvider({ defaultTheme = 'dark', children }: ThemeProviderProps) {
  const registryRef = useRef<Map<string, ThemeTokens>>(new Map(Object.entries(builtinThemes)));
  const [themeId, setThemeId] = useState<ThemeId>(defaultTheme);
  const [tokens, setTokens] = useState<ThemeTokens>(() => {
    return registryRef.current.get(defaultTheme) ?? lightTokens;
  });

  useEffect(() => {
    const resolved = registryRef.current.get(themeId) ?? lightTokens;
    setTokens(resolved);

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeId);
      applyTokensToElement(document.documentElement, resolved);
    }
  }, [themeId]);

  const value: ThemeContextValue = useMemo(() => ({
    themeId,
    tokens,
    setTheme(id: ThemeId) {
      setThemeId(id);
    },
    registerTheme(id: string, newTokens: ThemeTokens) {
      registryRef.current.set(id, newTokens);
    },
  }), [themeId, tokens]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
