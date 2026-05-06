import type { DesktopProps } from '../types';

export function Desktop({ children, wallpaper, style }: DesktopProps) {
  return (
    <div
      data-windeath44-desktop
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: wallpaper,
        backgroundImage: wallpaper ? undefined : "url('/assets/system/background.svg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
