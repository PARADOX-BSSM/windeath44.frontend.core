# windeath44.core/context-menu

우클릭 컨텍스트 메뉴. 뷰포트 경계 자동 조정, separator, submenu, disabled 항목 지원.

## Import

```typescript
import { ContextMenuProvider, useContextMenu } from 'windeath44.core/context-menu';
```

## 기본 사용법

```tsx
import { ContextMenuProvider, useContextMenu } from 'windeath44.core/context-menu';

function App() {
  return (
    <ContextMenuProvider>
      <MyDesktop />
    </ContextMenuProvider>
  );
}

function MyDesktop() {
  const { show } = useContextMenu();

  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        show({
          x: e.clientX,
          y: e.clientY,
          items: [
            { id: '1', type: 'action', label: '새 폴더', onClick: () => createFolder() },
            { id: '2', type: 'separator' },
            { id: '3', type: 'action', label: '붙여넣기', shortcut: 'Ctrl+V', onClick: () => paste() },
          ],
        });
      }}
    >
      바탕화면
    </div>
  );
}
```

## useContextMenu API

```typescript
const {
  show(options),  // 메뉴 표시
  hide(),         // 메뉴 닫기
} = useContextMenu();
```

## MenuItem 타입

```typescript
// 액션 항목
{ id, type: 'action', label, icon?, shortcut?, disabled?, onClick }

// 서브메뉴
{ id, type: 'submenu', label, icon?, disabled?, children: MenuItem[] }

// 구분선
{ id, type: 'separator' }
```

## 동작

- 메뉴 바깥 클릭 시 자동 닫힘 (pointerdown)
- `Escape` 키로 닫힘
- 뷰포트 경계 초과 시 위치 자동 조정
- `disabled` 항목 클릭 무시

## Tests

```
src/context-menu/ContextMenuTest/
└── ContextMenu.test.tsx  — 8 tests
```
