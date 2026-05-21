<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-22 | Updated: 2026-05-22 -->

# core/src/theme

## Purpose
테마 관리 모듈. CSS 변수 기반 디자인 토큰을 런타임에 적용한다. 빌트인 테마: light, dark, catppuccin. `@windeath44/core/theme` subpath로 export.

## Key Files

| File | Description |
|------|-------------|
| `ThemeProvider.tsx` | 테마 Context + Provider — 선택된 테마의 CSS 변수를 DOM에 적용 |
| `tokens.ts` | 디자인 토큰 타입 정의 |
| `index.ts` | public API: ThemeProvider, useTheme |
| `types.ts` | Theme, ThemeTokens 타입 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `themes/` | `light.ts`, `dark.ts`, `catppuccin.ts` — 빌트인 테마 토큰 값 |
| `ThemeTest/` | 단위 테스트 |

## For AI Agents

### Common Patterns
```typescript
import { useTheme } from '@windeath44/core/theme';

const { theme, setTheme } = useTheme();
setTheme('dark');
```

- windeath44 frontend의 실제 색상 토큰은 `src/widgets/tokens.ts`에서 CSS 변수로 정의됨 (XP 핑크 테마).

<!-- MANUAL: -->
