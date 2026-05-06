import type { CSSProperties, ReactNode } from 'react';

export interface DesktopProps {
  children?: ReactNode;
  wallpaper?: string;
  style?: CSSProperties;
}

export interface WindowLayerProps {
  children?: ReactNode;
}
