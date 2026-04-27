# PLAN: @windeath44/pdui

## 목적

JSON 기반 선언적 UI DSL(`.pdui`). WinForms에서 영감을 받아 UI 레이아웃을 JSON으로 기술하고
런타임에 React 엘리먼트로 렌더한다.

## 파일 형식

- 확장자: `.pdui`
- MIME: `application/vnd.windeath44.pdui+json`
- 스키마 URL: `https://windeath44.dev/schemas/pdui/v1.json`

## 디렉터리 구조

```
packages/pdui/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts
    ├── schema/
    │   ├── types.ts          # PduiDocument, PduiNode, 모든 위젯 props 타입
    │   └── validators.ts
    ├── parser/
    │   ├── PduiParser.ts     # string → PduiDocument
    │   └── errors.ts
    ├── renderer/
    │   ├── PduiRenderer.tsx  # PduiDocument → React elements
    │   └── PduiRendererContext.tsx
    ├── registry/
    │   ├── ComponentRegistry.ts
    │   └── builtins/
    │       ├── Button.tsx
    │       ├── TextInput.tsx
    │       ├── Label.tsx
    │       ├── Container.tsx
    │       ├── List.tsx
    │       ├── Image.tsx
    │       ├── Checkbox.tsx
    │       ├── Select.tsx
    │       └── index.ts
    ├── loader/
    │   └── usePdui.ts
    └── __tests__/
        ├── PduiParser.test.ts
        └── PduiRenderer.test.tsx
```

## .pdui JSON 스키마 예시

```json
{
  "$schema": "https://windeath44.dev/schemas/pdui/v1.json",
  "version": 1,
  "meta": {
    "title": "My App Window",
    "author": "windeath44"
  },
  "root": {
    "type": "Container",
    "props": { "layout": "vertical", "gap": 8, "padding": 16 },
    "children": [
      {
        "type": "Label",
        "props": { "id": "title", "text": "Hello, windeath44!", "variant": "heading" }
      },
      {
        "type": "TextInput",
        "props": { "id": "name-input", "placeholder": "Enter your name" },
        "events": { "onChange": "handlers.onNameChange" }
      },
      {
        "type": "Button",
        "props": { "id": "submit-btn", "label": "Submit", "variant": "primary" },
        "events": { "onClick": "handlers.onSubmit" }
      }
    ]
  },
  "handlers": {
    "onNameChange": null,
    "onSubmit": null
  }
}
```

## TypeScript Interfaces

```typescript
export interface PduiDocument {
  $schema?: string;
  version: 1;
  meta: { title: string; author?: string; description?: string; created?: string; };
  root: PduiNode;
  handlers?: Record<string, null>;
  renderers?: Record<string, null>;
}

export interface PduiNode {
  type: string;
  props?: Record<string, unknown>;
  children?: PduiNode[];
  events?: Record<string, string>;  // event → "handlers.xxx"
  _key?: string;                    // 파서가 자동 할당, stable React key
}

export type HandlerRegistry  = Record<string, ((...args: unknown[]) => void) | undefined>;
export type RendererRegistry = Record<string, ((item: unknown) => ReactNode) | undefined>;
```

## 구현 상세

### PduiParser

1. `JSON.parse(input)` — 실패 시 `PduiParseError(path, received)` throw
2. 재귀적 노드 검증: type 문자열, props 객체, children 배열
3. `_key` 자동 할당: depth-path 문자열 (`"root.children.0.children.1"`)

### ComponentRegistry

- 싱글턴 + `extend()` (샌드박스용 자식 레지스트리)
- 내장 위젯 8종 모듈 초기화 시 자동 등록
- `register(name, component)` / `resolve(name)`

### PduiRenderer

- `node.type` → `registry.resolve(type)` → React 엘리먼트 생성
- 미등록 타입: 개발 모드에서 `<div data-pdui-unknown-type>`, 프로덕션에서 `null`
- 이벤트 핸들러 바인딩: `"handlers.onSubmit"` → `handlers["onSubmit"]` 직접 조회
  - `eval`/`Function()` 절대 사용 금지
- children 재귀 렌더

### usePdui({ source?, url? })

- `url` 제공 시 `fetch` → `PduiParser.parse`
- SSR: `isServer()` 시 `{ document: null, loading: true, error: null }` 반환
- `SSRProvider`의 `payload.pdui.documents[url]`에서 pre-fetched 문서 읽기

### 내장 위젯 props 타입 (예시)

```typescript
interface ButtonProps {
  id?: string;
  label: string;
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: CSSProperties;
}

interface ContainerProps {
  id?: string;
  layout?: 'vertical' | 'horizontal' | 'grid';
  gap?: number;
  padding?: number;
  columns?: number;   // grid layout
  style?: CSSProperties;
}
```

## 테스트

| 파일 | 테스트 항목 |
|------|------------|
| `PduiParser.test.ts` | 유효한 JSON 파싱 성공 |
| `PduiParser.test.ts` | 잘못된 JSON → PduiParseError |
| `PduiParser.test.ts` | type 누락 노드 → PduiParseError |
| `PduiParser.test.ts` | _key 자동 할당 확인 |
| `PduiRenderer.test.tsx` | Button 렌더 + onClick 호출 |
| `PduiRenderer.test.tsx` | 미등록 타입 폴백 렌더 |
| `PduiRenderer.test.tsx` | 중첩 children 재귀 렌더 |

## 의존성

- `@windeath44/vfs` (VFS에서 .pdui 로드)
- `@windeath44/ssr`
- peerDependencies: `react >=18`
