# PLAN: @windeath44/theme

## 목적

CSS 커스텀 프로퍼티 기반 테마 시스템. `data-theme` attribute로 전환하며,
다른 모든 UI 패키지가 이 토큰을 참조한다.

## 디렉터리 구조

```
packages/theme/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts
    ├── types.ts
    ├── tokens.ts         # 토큰 정의
    ├── themes/
    │   ├── light.ts
    │   ├── dark.ts
    │   └── catppuccin.ts
    ├── ThemeProvider.tsx
    ├── useTheme.ts
    └── __tests__/
        └── ThemeProvider.test.tsx
```

## TypeScript Interfaces

```typescript
export interface ThemeTokens {
  // 색상
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
  // 타이포그래피
  fontFamily: string;
  fontSizeBase: string;
  fontSizeSm: string;
  fontSizeLg: string;
  // 간격
  spacingXs: string;
  spacingSm: string;
  spacingMd: string;
  spacingLg: string;
  spacingXl: string;
  // 테두리
  borderRadius: string;
  borderRadiusLg: string;
  // 그림자
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  // 전환
  transitionFast: string;
  transitionBase: string;
  // Z-index 기준값
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
```

## 구현 상세

### ThemeProvider

- `document.documentElement.setAttribute('data-theme', themeId)` 로 전환
- 커스텀 테마 등록: `registerTheme(id, tokens)` → 내부 Map에 저장
- CSS 변수 주입: `ThemeTokens`의 각 키를 `--wd-{kebab-case}` 형식으로 style 태그에 주입
- SSR: `isBrowser()` 가드로 DOM 접근 보호

### CSS 변수 예시

```css
[data-theme="dark"] {
  --wd-color-background: #1e1e2e;
  --wd-color-surface: #313244;
  --wd-color-text: #cdd6f4;
  /* ... */
}
```

### 내장 테마

- `light`: 밝은 회색 계열
- `dark`: 어두운 계열 (Catppuccin Mocha 기반)
- `catppuccin`: Catppuccin Latte (밝음)

## 테스트

| 파일 | 테스트 항목 |
|------|------------|
| `ThemeProvider.test.tsx` | 초기 테마 `data-theme` attribute 설정 확인 |
| `ThemeProvider.test.tsx` | `setTheme` 후 attribute 변경 확인 |
| `ThemeProvider.test.tsx` | `registerTheme` 후 `setTheme`으로 전환 가능 |
| `ThemeProvider.test.tsx` | `useTheme` 미사용 시 Error throw |

## 의존성

- `@windeath44/ssr`
- peerDependencies: `react >=18`
