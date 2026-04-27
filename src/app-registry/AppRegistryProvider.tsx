import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { AppRegistry } from './AppRegistry';
import type { AppRegistryContextValue } from './types';

const AppRegistryContext = createContext<AppRegistryContextValue | null>(null);

export function useAppRegistry(): AppRegistryContextValue {
  const ctx = useContext(AppRegistryContext);
  if (!ctx) throw new Error('useAppRegistry must be used inside <AppRegistryProvider>');
  return ctx;
}

export interface AppRegistryProviderProps {
  registry?: AppRegistry;
  children: ReactNode;
}

export function AppRegistryProvider({ registry, children }: AppRegistryProviderProps) {
  const instance = useMemo(() => registry ?? new AppRegistry(), [registry]);

  const value: AppRegistryContextValue = useMemo(
    () => ({
      register: (m) => instance.register(m),
      unregister: (n) => instance.unregister(n),
      getByName: (n) => instance.getByName(n),
      list: () => instance.list(),
      listByCategory: (c) => instance.listByCategory(c),
    }),
    [instance],
  );

  return <AppRegistryContext.Provider value={value}>{children}</AppRegistryContext.Provider>;
}
