import type { CSSProperties, ReactNode } from 'react';

export interface ScaleContextValue {
  scale: number;
  setScale(value: number): void;
  resetScale(): void;
}

export interface DesktopProps {
  children?: ReactNode;
  wallpaper?: string;
  style?: CSSProperties;
}

export interface WindowLayerProps {
  children?: ReactNode;
}
