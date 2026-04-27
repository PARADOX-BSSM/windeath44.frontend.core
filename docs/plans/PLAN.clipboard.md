# PLAN: @windeath44/clipboard

## 목적

프로세스 간 공유 가상 클립보드. 내부 복사/붙여넣기를 위한 API와
브라우저 Clipboard API 브릿지를 제공한다.

## 디렉터리 구조

```
packages/clipboard/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts
    ├── types.ts
    ├── ClipboardProvider.tsx
    ├── hooks/
    │   └── useClipboard.ts
    └── __tests__/
        └── useClipboard.test.tsx
```

## TypeScript Interfaces

```typescript
export type ClipboardDataType = 'text' | 'files' | 'image';

export interface ClipboardTextData {
  type: 'text';
  text: string;
  html?: string;
}

export interface ClipboardFilesData {
  type: 'files';
  files: VirtualFile[];   // VFS FileNode 참조
}

export interface ClipboardImageData {
  type: 'image';
  dataUrl: string;
  mimeType: string;
}

export type ClipboardData = ClipboardTextData | ClipboardFilesData | ClipboardImageData;

export interface ClipboardContextValue {
  data: ClipboardData | null;
  write(data: ClipboardData): void;
  read(): ClipboardData | null;
  clear(): void;
  // 브라우저 시스템 클립보드와 동기화
  writeToSystem(text: string): Promise<void>;
  readFromSystem(): Promise<string | null>;
}
```

## 구현 상세

### ClipboardProvider

- 내부 상태: `data: ClipboardData | null` (Zustand 또는 useState)
- `write(data)` → 상태 업데이트 + IPC `'clipboard:changed'` 발행
- `writeToSystem(text)` → `navigator.clipboard.writeText(text)` (isBrowser 가드)
- `readFromSystem()` → `navigator.clipboard.readText()` (isBrowser 가드, 권한 없으면 null)

### IPC 채널 추가 (declaration merging)

```typescript
declare module '@windeath44/kernel' {
  interface SystemEventMap {
    'clipboard:changed': { type: ClipboardDataType };
  }
}
```

### useClipboard

```typescript
function useClipboard(): ClipboardContextValue
```

## 테스트

| 파일 | 테스트 항목 |
|------|------------|
| `useClipboard.test.tsx` | `write` 후 `read` 동일 데이터 반환 |
| `useClipboard.test.tsx` | `clear` 후 null 반환 |
| `useClipboard.test.tsx` | `writeToSystem` — Clipboard API mock 호출 확인 |
| `useClipboard.test.tsx` | 브라우저 API 없는 환경에서 readFromSystem → null |

## 의존성

- `@windeath44/react-kernel`
- `@windeath44/ssr`
- peerDependencies: `react >=18`
