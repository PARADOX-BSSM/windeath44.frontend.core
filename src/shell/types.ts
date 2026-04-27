import type { CSSProperties, ReactNode } from 'react';

export interface DesktopProps {
  /** taskbar, launcher 등 소비자가 추가하는 UI */
  children?: ReactNode;
  /** CSS background 값 (색상, 이미지 URL 등) */
  wallpaper?: string;
  style?: CSSProperties;
}

export interface WindowLayerProps {
  children?: ReactNode;
}

export interface ScaleContextValue {
  /** devicePixelRatio 기반 현재 스케일 배수 */
  scale: number;
  /** 사용자 정의 스케일 오버라이드 (1.0 = 100%) */
  setScale(value: number): void;
  /** 스케일을 devicePixelRatio 기본값으로 리셋 */
  resetScale(): void;
}
