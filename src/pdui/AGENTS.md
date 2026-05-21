<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-22 | Updated: 2026-05-22 -->

# core/src/pdui

## Purpose
PDUI(Parametric Declarative UI) 마크업 언어 구현. JSON으로 UI 레이아웃을 선언하고 런타임에 React 컴포넌트로 렌더링한다. windeath44 앱의 뷰 레이어를 담당한다. 상세 사용법: `packages/core/docs/pdui.md`.

## Key Files

| File | Description |
|------|-------------|
| `index.ts` | public API: PduiParser, PduiRenderer, defaultRegistry |
| `README.md` | PDUI 형식 설명 및 바인딩 패턴 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `parser/` | `PduiParser.ts` — JSON → PDUI 문서 파싱, `errors.ts` — 파싱 에러 타입 |
| `registry/` | `ComponentRegistry.ts` — 위젯 타입명 → React 컴포넌트 매핑 |
| `renderer/` | `PduiRenderer.tsx` — PDUI 문서를 React 트리로 렌더링 |
| `schema/` | `types.ts` — PDUI 문서 스키마 타입 |
| `PduiTest/` | 단위 테스트 |

## For AI Agents

### Working In This Directory
- PDUI JSON의 `type` 필드 → `ComponentRegistry`에 등록된 컴포넌트 이름과 일치해야 함.
- 핸들러 문자열(`"_onSubmit"` 등)은 `handlers` 객체의 키를 참조 — `eval()`/`new Function()` **절대 금지**.
- 데이터 바인딩: `data` 객체의 `_` 접두어 키를 PDUI JSON에서 참조.
- 커스텀 위젯 등록: `PduiRegistry.register('MyWidget', MyComponent)` — 앱의 `Widgets.tsx`에서 수행.

### Common Patterns
```typescript
// 파싱
const doc = PduiParser.parse(JSON.stringify(myPageJson));

// 렌더링
<PduiRenderer
  document={doc}
  handlers={{ onSubmit: handleSubmit, goBack: () => vm.navigate('home') }}
  data={{ _items: items, _loading: isLoading }}
/>

// 커스텀 위젯 등록 (Widgets.tsx)
import { PduiRegistry } from '@windeath44/core/pdui'; // 또는 ComponentRegistry 직접
PduiRegistry.register('MyCard', MyCardComponent);
```

## Dependencies

### External
- React 18 (renderer)

<!-- MANUAL: -->
