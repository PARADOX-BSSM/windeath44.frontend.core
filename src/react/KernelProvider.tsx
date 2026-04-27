import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { initKernel, type Kernel, type KernelConfig } from '../kernel/Kernel';

const KernelContext = createContext<Kernel | null>(null);

export function useKernel(): Kernel {
  const kernel = useContext(KernelContext);
  if (!kernel) throw new Error('useKernel must be used inside <KernelProvider>');
  return kernel;
}

export interface KernelProviderProps {
  config: KernelConfig;
  children: ReactNode;
  fallback?: ReactNode;
}

export function KernelProvider({ config, children, fallback }: KernelProviderProps) {
  const kernel = useMemo(() => initKernel(), []);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    kernel.boot(config).then(() => setBooted(true));
    // config는 one-shot boot 전용이므로 deps에서 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kernel]);

  if (!booted) return <>{fallback ?? null}</>;

  return <KernelContext.Provider value={kernel}>{children}</KernelContext.Provider>;
}
