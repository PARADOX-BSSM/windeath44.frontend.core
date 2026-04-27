import type { WindowLayerProps } from '../types';

export function WindowLayer({ children }: WindowLayerProps) {
  return (
    <div
      data-windeath44-window-layer
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
    >
      {children}
    </div>
  );
}
