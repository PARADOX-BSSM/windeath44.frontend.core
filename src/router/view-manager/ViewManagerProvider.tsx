import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  ViewDefinition,
  ViewManagerConfig,
  ViewManagerContextValue,
  ViewNavigateOptions,
} from './types';

// ── Context ──────────────────────────────────────────────────────────

const ViewManagerContext = createContext<ViewManagerContextValue<any> | null>(null);

// ── Hook ─────────────────────────────────────────────────────────────

/**
 * Access the view manager for the current app.
 * ViewName is inferred from the nearest ViewManagerProvider.
 */
export function useViewManager<ViewName extends string = string>(): ViewManagerContextValue<ViewName> {
  const ctx = useContext(ViewManagerContext);
  if (!ctx) throw new Error('useViewManager must be used inside <ViewManagerProvider>');
  return ctx as ViewManagerContextValue<ViewName>;
}

// ── Internal: History Entry ──────────────────────────────────────────

interface HistoryEntry<ViewName extends string> {
  view: ViewName;
  data?: unknown;
}

// ── Provider ─────────────────────────────────────────────────────────

export interface ViewManagerProviderProps<ViewName extends string = string> {
  config: ViewManagerConfig<ViewName>;
  children: ReactNode;
}

export function ViewManagerProvider<ViewName extends string = string>({
  config,
  children,
}: ViewManagerProviderProps<ViewName>) {
  const viewMap = useMemo(() => {
    const map = new Map<ViewName, ViewDefinition<ViewName>>();
    for (const v of config.views) map.set(v.name, v);
    return map;
  }, [config.views]);

  const maxHistory = config.maxHistorySize ?? 50;

  // History stack (ref to avoid re-renders on internal mutations)
  const historyRef = useRef<HistoryEntry<ViewName>[]>([
    { view: config.initialView, data: config.initialData },
  ]);
  const indexRef = useRef(0);

  // Force re-render trigger
  const [tick, setTick] = useState(0);
  const rerender = useCallback(() => setTick(t => t + 1), []);

  const getCurrentEntry = useCallback(
    (): HistoryEntry<ViewName> => historyRef.current[indexRef.current],
    [],
  );

  const getCurrentViewDef = useCallback(
    (): ViewDefinition<ViewName> => {
      const entry = getCurrentEntry();
      const def = viewMap.get(entry.view);
      if (!def) throw new Error(`[ViewManager] Unknown view: ${entry.view}`);
      return def;
    },
    [viewMap, getCurrentEntry],
  );

  const navigate = useCallback(
    (view: ViewName, options?: ViewNavigateOptions) => {
      const def = viewMap.get(view);
      if (!def) {
        console.warn(`[ViewManager] Unknown view: ${view}`);
        return;
      }

      const entry: HistoryEntry<ViewName> = { view, data: options?.data };

      if (options?.skipHistory) {
        // Replace current entry without pushing
        historyRef.current[indexRef.current] = entry;
      } else if (options?.replace) {
        // Replace current entry
        historyRef.current[indexRef.current] = entry;
      } else {
        // Push new entry, truncate any forward history
        historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
        historyRef.current.push(entry);
        indexRef.current = historyRef.current.length - 1;

        // Enforce max size
        if (historyRef.current.length > maxHistory) {
          historyRef.current = historyRef.current.slice(-maxHistory);
          indexRef.current = historyRef.current.length - 1;
        }
      }

      rerender();
    },
    [viewMap, maxHistory, rerender],
  );

  const back = useCallback(() => {
    if (indexRef.current > 0) {
      indexRef.current -= 1;
      rerender();
    }
  }, [rerender]);

  const canBack = useCallback(() => indexRef.current > 0, []);

  const setData = useCallback(
    (data: unknown) => {
      historyRef.current[indexRef.current].data = data;
      rerender();
    },
    [rerender],
  );

  const value: ViewManagerContextValue<ViewName> = useMemo(
    () => ({
      currentView: getCurrentEntry().view,
      currentViewDef: getCurrentViewDef(),
      viewData: getCurrentEntry().data,
      viewHistory: historyRef.current.slice(0, indexRef.current + 1).map(e => e.view),
      navigate,
      back,
      canBack,
      setData,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tick, navigate, back, canBack, setData, getCurrentEntry, getCurrentViewDef],
  );

  return (
    <ViewManagerContext.Provider value={value}>
      {children}
    </ViewManagerContext.Provider>
  );
}

// ── Utility: create view config ──────────────────────────────────────

/**
 * Helper to create a ViewManagerConfig with full type inference.
 */
export function defineViews<ViewName extends string>(
  views: ViewDefinition<ViewName>[],
  initialView: ViewName,
): ViewManagerConfig<ViewName> {
  return { views, initialView };
}
