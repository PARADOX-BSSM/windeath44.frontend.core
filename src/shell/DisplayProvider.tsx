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
  /** 디스플레이의 가로세로비 (예: 4/3) */
  aspectRatio: number;
  /** 디자인 공간의 기준 너비 (px) */
  designWidth: number;
  /** 디자인 공간의 기준 높이 (px) */
  designHeight: number;
  /** 현재 실제 디스플레이 너비 (px) */
  displayWidth: number;
  /** 현재 실제 디스플레이 높이 (px) */
  displayHeight: number;
  /** 1 디자인-픽셀이 실제 몇 px인지 (스케일 팩터) */
  scale: number;
  /** 디자인 공간 → 실제 화상 px 변환: designPx × unitX = screen px */
  unitX: number;
  /** 디자인 공간 → 실제 화상 px 변환: designPx × unitY = screen px */
  unitY: number;
  /** 비율 오버라이드 */
  setAspectRatio(ratio: number): void;
  /** 비율을 기본값으로 리셋 */
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
  /** 가로세로비 (기본 4/3) */
  aspectRatio?: number;
  /** 디자인 기준 해상도 (기본 1280x960 = 표준 4:3) */
  designWidth?: number;
  designHeight?: number;
}

export function DisplayProvider({
  children,
  aspectRatio: initialRatio = 4 / 3,
  designWidth = 1280,
  designHeight = 960,
}: DisplayProviderProps) {
  const [ratio, setRatio] = useState(initialRatio);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const apply = () => {
      const rect = el.getBoundingClientRect();
      const dw = rect.width;
      const dh = rect.height;
      const scaleX = dw / designWidth;
      const scaleY = dh / designHeight;

      el.style.setProperty('--vw', `${scaleX}px`);
      el.style.setProperty('--vh', `${scaleY}px`);

      setDims({ w: dw, h: dh });
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ratio, designWidth, designHeight]);

  const scale = dims.w / designWidth;
  const unitX = dims.w / designWidth;
  const unitY = dims.h / designHeight;

  const resetAspectRatio = useCallback(() => setRatio(initialRatio), [initialRatio]);

  const value: DisplayContextValue = {
    aspectRatio: ratio,
    designWidth,
    designHeight,
    displayWidth: dims.w,
    displayHeight: dims.h,
    scale,
    unitX,
    unitY,
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
