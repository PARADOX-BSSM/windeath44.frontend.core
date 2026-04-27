# windeath44.core/pdui

JSON 기반 선언적 UI DSL. `.pdui` 파일을 파싱해 React 엘리먼트로 렌더한다.

## Import

```typescript
import { PduiParser, PduiRenderer } from 'windeath44.core/pdui';
```

## 기본 사용법

```tsx
const source = JSON.stringify({
  version: 1,
  meta: { title: 'My Form' },
  root: {
    type: 'Container',
    props: { layout: 'vertical', gap: 8 },
    children: [
      { type: 'Label', props: { text: '이름 입력' } },
      { type: 'TextInput', props: { placeholder: '홍길동' }, events: { onChange: 'handlers.onName' } },
      { type: 'Button', props: { label: '확인', variant: 'primary' }, events: { onClick: 'handlers.onSubmit' } },
    ],
  },
});

const doc = PduiParser.parse(source);

<PduiRenderer
  document={doc}
  handlers={{ onName: (v) => console.log(v), onSubmit: () => submit() }}
/>
```

## 내장 위젯

| 위젯 | 주요 props |
|------|-----------|
| `Button` | `label`, `variant`, `disabled`, `onClick` |
| `Label` | `text`, `variant` |
| `TextInput` | `placeholder`, `value`, `disabled`, `onChange` |
| `Container` | `layout` (vertical/horizontal/grid), `gap`, `padding`, `columns` |
| `List` | `items: string[]` |
| `Image` | `src`, `alt` |
| `Checkbox` | `label`, `checked`, `disabled`, `onChange` |
| `Select` | `options: {value,label}[]`, `value`, `onChange` |

## 커스텀 위젯 등록

```typescript
import { defaultRegistry } from 'windeath44.core/pdui';

defaultRegistry.register('MyWidget', ({ text }) => <div>{String(text)}</div>);
```

## 이벤트 핸들러 바인딩

```json
{ "type": "Button", "events": { "onClick": "handlers.onSave" } }
```

`"handlers.xxx"` 형태로 `PduiRenderer`의 `handlers` prop과 연결. `eval` 사용 없음.

## Tests

```
src/pdui/PduiTest/
├── PduiParser.test.ts    — 7 tests
└── PduiRenderer.test.tsx — 5 tests
```
