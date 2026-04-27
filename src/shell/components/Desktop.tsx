import { WindowLayer } from './WindowLayer';
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
        ...style,
      }}
    >
      <WindowLayer />
      {children}
    </div>
  );
}
