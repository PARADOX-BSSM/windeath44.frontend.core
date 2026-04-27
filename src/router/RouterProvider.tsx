import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { HistoryAdapter, RouteDefinition, RouterContextValue, RouterMode } from './types';
import { HashHistoryAdapter } from './history/HashHistoryAdapter';
import { BrowserHistoryAdapter } from './history/BrowserHistoryAdapter';
import { matchRoute } from './matchRoute';
import { decodeDeepLink } from './deepLink';

const RouterContext = createContext<RouterContextValue | null>(null);

export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used inside <RouterProvider>');
  return ctx;
}

export interface RouterProviderProps {
  mode?: RouterMode;
  routes?: RouteDefinition[];
  initialPath?: string;
  children: ReactNode;
}

export function RouterProvider({
  mode = 'hash',
  routes = [],
  initialPath = '/',
  children,
}: RouterProviderProps) {
  const adapterRef = useRef<HistoryAdapter>(
    mode === 'hash'
      ? new HashHistoryAdapter(initialPath)
      : new BrowserHistoryAdapter(initialPath),
  );

  const [location, setLocation] = useState(() => adapterRef.current.getLocation());

  useEffect(() => {
    return adapterRef.current.listen(setLocation);
  }, []);

  const match = useMemo(() => matchRoute(location, routes), [location, routes]);

  const value: RouterContextValue = useMemo(
    () => ({
      location,
      match,
      navigate(path, options) {
        if (options?.replace) {
          adapterRef.current.replace(path, options.state);
        } else {
          adapterRef.current.push(path, options?.state);
        }
        setLocation(path);
      },
      navigateDeepLink(raw) {
        const link = decodeDeepLink(raw);
        if (!link) return;
        const path = link.path;
        adapterRef.current.push(path);
        setLocation(path);
      },
      back() { adapterRef.current.back(); },
      forward() { adapterRef.current.forward(); },
    }),
    [location, match],
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}
