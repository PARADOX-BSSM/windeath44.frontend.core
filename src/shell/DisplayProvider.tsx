import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export interface DisplayContextValue {
  aspectRatio: number;
  designWidth: number;
  designHeight: number;
  displayWidth: number;
  displayHeight: number;
  scale: number;
  unitX: number;
  unitY: number;
  pixelRatio: number;
  setAspectRatio(ratio: number): void;
  resetAspectRatio(): void;
}

const DisplayContext = createContext<DisplayContextValue | null>(null);

export function useDisplay(): DisplayContextValue {
  const ctx = useContext(DisplayContext);
  if (!ctx) throw new Error('useDisplay must be used inside <DisplayProvider>');
  return ctx;
}

export interface DisplayProviderProps {
  children: ReactNode;
  aspectRatio?: number;
}

export function DisplayProvider({
  children,
  aspectRatio: initialRatio = 4 / 3,
}: DisplayProviderProps) {
  const [ratio, setRatio] = useState(initialRatio);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [pixelRatio, setPixelRatio] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const apply = () => {
      const rect = el.getBoundingClientRect();
      const dw = rect.width;
      const dh = rect.height;
      const dpr = window.devicePixelRatio || 1;

      el.style.setProperty('--vw', '1px');
      el.style.setProperty('--vh', '1px');

      setDims({ w: dw, h: dh });
      setPixelRatio(dpr);
    };

    apply();

    const ro = new ResizeObserver(apply);
    ro.observe(el);

    let currentDpr = window.devicePixelRatio || 1;
    let dprMedia = window.matchMedia(`(resolution: ${currentDpr}dppx)`);
    const onDprChange = () => {
      currentDpr = window.devicePixelRatio || 1;
      dprMedia.removeEventListener('change', onDprChange);
      dprMedia = window.matchMedia(`(resolution: ${currentDpr}dppx)`);
      dprMedia.addEventListener('change', onDprChange);
      apply();
    };
    dprMedia.addEventListener('change', onDprChange);

    return () => {
      ro.disconnect();
      dprMedia.removeEventListener('change', onDprChange);
    };
  }, [ratio]);

  const designWidth = dims.w;
  const designHeight = dims.h;
  const scale = 1;
  const dpr = pixelRatio || 1;

  const resetAspectRatio = useCallback(() => setRatio(initialRatio), [initialRatio]);

  const value: DisplayContextValue = {
    aspectRatio: ratio,
    designWidth,
    designHeight,
    displayWidth: dims.w,
    displayHeight: dims.h,
    scale,
    unitX: scale,
    unitY: scale,
    pixelRatio: dpr,
    setAspectRatio: setRatio,
    resetAspectRatio,
  };

  return (
    <DisplayContext.Provider value={value}>
      <div
        ref={containerRef}
        data-windeath44-display
        style={{
          position: 'relative',
          aspectRatio: `${ratio}`,
          height: '100%',
          maxWidth: '100%',
          margin: 'auto',
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: '#ffbbf5',
          backgroundImage: "url('/assets/system/skeleton.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {children}
      </div>
    </DisplayContext.Provider>
  );
}
