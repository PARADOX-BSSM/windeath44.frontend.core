# windeath44.core/theme

CSS 커스텀 프로퍼티 기반 테마 시스템.

## Import

```typescript
import { ThemeProvider, useTheme } from 'windeath44.core/theme';
```

## 기본 사용법

```tsx
import { ThemeProvider, useTheme } from 'windeath44.core/theme';

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <MyApp />
    </ThemeProvider>
  );
}

function ThemeSwitcher() {
  const { themeId, setTheme } = useTheme();
  return (
    <button onClick={() => setTheme(themeId === 'dark' ? 'light' : 'dark')}>
      Toggle theme
    </button>
  );
}
```

## 내장 테마

| ID | 설명 |
|----|------|
| `dark` | Catppuccin Mocha 기반 다크 테마 (기본값) |
| `light` | 밝은 회색 계열 라이트 테마 |
| `catppuccin` | Catppuccin Latte (밝음) |

## 커스텀 테마 등록

```tsx
const { registerTheme, setTheme } = useTheme();

registerTheme('my-theme', {
  colorBackground: '#0d1117',
  colorSurface: '#161b22',
  // ... 전체 ThemeTokens 필드
});

setTheme('my-theme');
```

## useTheme API

```typescript
const {
  themeId,          // 현재 테마 ID
  tokens,           // ThemeTokens — 현재 테마의 토큰 값
  setTheme(id),     // 테마 전환 (data-theme attribute + CSS vars 갱신)
  registerTheme(id, tokens), // 커스텀 테마 등록
} = useTheme();
```

## CSS 변수

테마 전환 시 `document.documentElement`에 CSS 커스텀 프로퍼티가 주입된다.
`[data-theme]` 셀렉터로도 접근 가능하다.

```css
/* camelCase 토큰 키 → --wd-{kebab-case} */
var(--wd-color-background)
var(--wd-color-surface)
var(--wd-color-text)
var(--wd-font-size-base)
var(--wd-spacing-md)
var(--wd-border-radius)
var(--wd-shadow-md)
var(--wd-z-index-window)
```

## Tests

```
src/theme/ThemeTest/
└── ThemeProvider.test.tsx  — 5 tests
```
