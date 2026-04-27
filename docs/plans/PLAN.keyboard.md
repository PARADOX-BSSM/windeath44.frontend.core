# PLAN: @windeath44/keyboard

## 목적

전역 키보드 단축키 시스템. 프로세스별 스코프를 지원하며, 충돌 감지 기능을 포함한다.

## 디렉터리 구조

```
packages/keyboard/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts
    ├── types.ts
    ├── KeymapProvider.tsx
    ├── parseShortcut.ts     # "Ctrl+Shift+K" → normalized KeyCombo
    ├── hooks/
    │   └── useKeybinding.ts
    └── __tests__/
        ├── parseShortcut.test.ts
        └── useKeybinding.test.tsx
```

## TypeScript Interfaces

```typescript
export interface KeyCombo {
  key: string;          // lowercase, e.g. "k"
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;        // Cmd on Mac
}

export interface KeybindingRegistration {
  id: string;
  combo: KeyCombo;
  description?: string;
  pid?: number;         // 특정 프로세스 스코프 (undefined = 전역)
  handler: (event: KeyboardEvent) => void;
}

export interface KeymapContextValue {
  register(registration: KeybindingRegistration): () => void;  // unregister 반환
  getBindings(): KeybindingRegistration[];
}
```

## 구현 상세

### parseShortcut

```typescript
parseShortcut("Ctrl+Shift+K")
// → { key: "k", ctrl: true, shift: true, alt: false, meta: false }
```

- 대소문자 무시, 순서 무관
- Mac: `Cmd` = meta, Windows: `Win` = meta
- `+` 구분자

### KeymapProvider

- `document.addEventListener('keydown', handleKeyDown)` — 전역 리스너
- `handleKeyDown`: 이벤트 → `KeyCombo` 변환 → 등록된 핸들러 순회
  - 충돌(같은 combo + 같은 scope): 경고 로그, 마지막 등록 우선
- `register()` → unregister 함수 반환
- SSR: `isBrowser()` 가드

### useKeybinding

```typescript
function useKeybinding(
  shortcut: string,
  handler: (event: KeyboardEvent) => void,
  options?: { pid?: number; description?: string; enabled?: boolean }
): void
```

- 마운트 시 `register`, 언마운트 시 unregister 자동
- `enabled=false` 시 등록 안 함

## 테스트

| 파일 | 테스트 항목 |
|------|------------|
| `parseShortcut.test.ts` | "Ctrl+K" 파싱 |
| `parseShortcut.test.ts` | 대소문자·순서 무관 확인 |
| `useKeybinding.test.tsx` | 키 이벤트 발생 시 핸들러 호출 |
| `useKeybinding.test.tsx` | 언마운트 시 리스너 제거 |
| `useKeybinding.test.tsx` | enabled=false 시 핸들러 미호출 |

## 의존성

- `@windeath44/react-kernel`
- `@windeath44/ssr`
- peerDependencies: `react >=18`
