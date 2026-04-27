# PLAN: @windeath44/context-menu

## 목적

우클릭 컨텍스트 메뉴. 뷰포트 경계를 벗어나지 않도록 위치를 자동 조정하며,
중첩 서브메뉴를 지원한다.

## 디렉터리 구조

```
packages/context-menu/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts
    ├── types.ts
    ├── ContextMenuProvider.tsx
    ├── components/
    │   ├── ContextMenu.tsx
    │   └── ContextMenuItem.tsx
    ├── hooks/
    │   └── useContextMenu.ts
    └── __tests__/
        └── ContextMenu.test.tsx
```

## TypeScript Interfaces

```typescript
export interface MenuItemBase {
  id: string;
}

export interface ActionMenuItem extends MenuItemBase {
  type: 'action';
  label: string;
  icon?: ReactNode;
  shortcut?: string;       // e.g. "Ctrl+C"
  disabled?: boolean;
  onClick: () => void;
}

export interface SubMenuItem extends MenuItemBase {
  type: 'submenu';
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  children: MenuItem[];
}

export interface SeparatorMenuItem extends MenuItemBase {
  type: 'separator';
}

export type MenuItem = ActionMenuItem | SubMenuItem | SeparatorMenuItem;

export interface ShowContextMenuOptions {
  x: number;
  y: number;
  items: MenuItem[];
}

export interface ContextMenuContextValue {
  show(options: ShowContextMenuOptions): void;
  hide(): void;
}
```

## 구현 상세

### ContextMenuProvider

- 현재 열린 메뉴 상태: `{ visible, x, y, items }`
- `document.addEventListener('pointerdown', hide)` — 바깥 클릭 시 닫기
- `document.addEventListener('keydown', e => e.key === 'Escape' && hide())`
- `useEffect` cleanup에서 이벤트 리스너 제거

### ContextMenu 위치 계산

```typescript
function clampToViewport(x: number, y: number, menuWidth: number, menuHeight: number) {
  return {
    x: Math.min(x, window.innerWidth - menuWidth - 8),
    y: Math.min(y, window.innerHeight - menuHeight - 8),
  };
}
```

메뉴 렌더 후 `getBoundingClientRect()`로 실제 크기 측정 → 재조정.

### SubMenu

- 호버 시 우측에 표시 (뷰포트 우측 경계 시 좌측으로 flip)
- 중첩 깊이 제한 없음

### useContextMenu

```typescript
export function useContextMenu(): ContextMenuContextValue;
```

## 테스트

| 파일 | 테스트 항목 |
|------|------------|
| `ContextMenu.test.tsx` | `show()` 후 메뉴 DOM 렌더 확인 |
| `ContextMenu.test.tsx` | 외부 클릭 시 닫힘 |
| `ContextMenu.test.tsx` | Escape 키로 닫힘 |
| `ContextMenu.test.tsx` | separator 렌더 확인 |
| `ContextMenu.test.tsx` | disabled 항목 클릭 무시 |

## 의존성

- `@windeath44/theme`
- peerDependencies: `react >=18`
