export interface ThemeTokens {
  colorBackground: string;
  colorSurface: string;
  colorSurfaceHover: string;
  colorBorder: string;
  colorText: string;
  colorTextMuted: string;
  colorPrimary: string;
  colorPrimaryHover: string;
  colorDanger: string;
  colorSuccess: string;
  colorWarning: string;
  fontFamily: string;
  fontSizeBase: string;
  fontSizeSm: string;
  fontSizeLg: string;
  spacingXs: string;
  spacingSm: string;
  spacingMd: string;
  spacingLg: string;
  spacingXl: string;
  borderRadius: string;
  borderRadiusLg: string;
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  transitionFast: string;
  transitionBase: string;
  zIndexWindow: number;
  zIndexModal: number;
  zIndexNotification: number;
  zIndexContextMenu: number;
}

export type ThemeId = 'light' | 'dark' | 'catppuccin' | string;

export interface ThemeContextValue {
  themeId: ThemeId;
  tokens: ThemeTokens;
  setTheme(id: ThemeId): void;
  registerTheme(id: string, tokens: ThemeTokens): void;
}
