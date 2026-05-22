import type { ReactNode } from 'react';

export type WindowStatus = 'normal' | 'minimized' | 'maximized';

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  pid: number;
  packageId?: string;
  parentWindowId?: string;
  title: string;
  icon?: string;
  position: WindowPosition;
  size: WindowSize;
  minSize: WindowSize;
  zIndex: number;
  status: WindowStatus;
  resizable: boolean;
  closable: boolean;
}

export interface OpenWindowOptions {
  pid: number;
  packageId?: string;
  parentWindowId?: string;
  title: string;
  icon?: string;
  initialPosition?: Partial<WindowPosition>;
  initialSize?: Partial<WindowSize>;
  minSize?: Partial<WindowSize>;
  resizable?: boolean;
  closable?: boolean;
  children: ReactNode;
}
