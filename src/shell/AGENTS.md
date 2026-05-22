<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-22 | Updated: 2026-05-22 -->

# core/src/shell

## Purpose
데스크톱 디스플레이 레이어. `Desktop` 컴포넌트(바탕화면)와 `WindowLayer`(창 렌더링 영역)를 제공한다. 화면 스케일 및 해상도 어댑테이션도 담당. `@windeath44/core/shell` subpath로 export.

## Key Files

| File | Description |
|------|-------------|
| `DisplayProvider.tsx` | 화면 크기/해상도 Context |
| `ScaleProvider.tsx` | 스케일 팩터 Context (고DPI 대응) |
| `shellFeature.ts` | 커널 feature로 등록되는 shell 초기화 |
| `index.ts` | public API: Desktop, WindowLayer, useDisplay, useScale, shellFeature |
| `types.ts` | DisplayConfig, ScaleConfig 타입 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `components/` | `Desktop.tsx`, `WindowLayer.tsx` — 실제 렌더링 컴포넌트 |
| `ShellTest/` | 단위 테스트 |

## For AI Agents

### Common Patterns
```typescript
import { Desktop, WindowLayer, shellFeature } from '@windeath44/core/shell';

// 커널 features 배열에 추가
const features = [shellFeature, ...otherFeatures];

// 레이아웃
<Desktop>
  <WindowLayer />
  {/* taskbar, icons 등 */}
</Desktop>
```

<!-- MANUAL: -->
