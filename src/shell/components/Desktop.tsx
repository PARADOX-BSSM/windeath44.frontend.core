import type { DesktopProps } from '../types';

export function Desktop({ children, wallpaper, style }: DesktopProps) {
  const bg: React.CSSProperties = wallpaper
    ? { background: wallpaper }
    : {
        backgroundColor: '#2e2e2e',
        backgroundImage: "url('/assets/system/background.svg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };

  return (
    <div
      data-windeath44-desktop
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...bg,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
