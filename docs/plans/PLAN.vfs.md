# PLAN: @windeath44/vfs

## 목적

어댑터 패턴 기반 가상 파일 시스템(VFS). POSIX 스타일 경로를 사용하며,
메모리·LocalStorage·IndexedDB 백엔드를 지원한다.

## 디렉터리 구조

```
packages/vfs/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts
    ├── types.ts
    ├── path.ts                       # POSIX 경로 유틸 (zero-dep)
    ├── VFSProvider.tsx
    ├── useFS.ts
    ├── adapters/
    │   ├── IFileSystemAdapter.ts
    │   ├── MemoryAdapter.ts
    │   ├── LocalStorageAdapter.ts
    │   └── IndexedDBAdapter.ts
    └── __tests__/
        ├── MemoryAdapter.test.ts
        ├── LocalStorageAdapter.test.ts
        └── path.test.ts
```

## TypeScript Interfaces

```typescript
export type FileNodeType = 'file' | 'directory';

export interface FileMetadata {
  createdAt: number;
  modifiedAt: number;
  size: number;          // bytes; 0 for directories
  mimeType?: string;
  tags?: Record<string, string>;
}

export interface FileNode {
  type: FileNodeType;
  name: string;
  path: string;          // absolute POSIX, e.g. "/home/user/docs/readme.txt"
  metadata: FileMetadata;
}

export type VFSErrorCode = 'ENOENT' | 'EEXIST' | 'ENOTDIR' | 'EISDIR' | 'ENOTEMPTY' | 'EPERM';

export class VFSError extends Error {
  constructor(
    public readonly code: VFSErrorCode,
    public readonly path: string,
    message: string,
  ) { ... }
}

export interface FSWatchEvent {
  type: 'created' | 'modified' | 'deleted' | 'renamed';
  path: string;
  newPath?: string;
}

export interface SerializedFS {
  version: 1;
  nodes: Array<{
    path: string;
    type: 'file' | 'directory';
    content?: string;
    metadata: FileMetadata;
  }>;
}
```

## IFileSystemAdapter

```typescript
export interface IFileSystemAdapter {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string, mkdirp?: boolean): Promise<void>;
  unlink(path: string): Promise<void>;
  rmdir(path: string, recursive?: boolean): Promise<void>;
  mkdir(path: string, exist_ok?: boolean): Promise<void>;
  readdir(path: string): Promise<FileNode[]>;
  stat(path: string): Promise<FileNode>;
  exists(path: string): Promise<boolean>;
  rename(oldPath: string, newPath: string): Promise<void>;
  copy(src: string, dest: string): Promise<void>;
  watch(path: string, cb: (event: FSWatchEvent) => void, recursive?: boolean): () => void;
  serialize(): SerializedFS;
  hydrate(data: SerializedFS): void;
}
```

## 구현 상세

### MemoryAdapter

- `Map<string, InternalNode>` 단일 맵으로 관리
- 모든 메서드는 `Promise.resolve()` 래핑 (인터페이스 준수)
- watch: `Set<WatcherEntry>` — mutation 후 동기 콜백
- SSR 완전 안전 (브라우저 API 없음)

### LocalStorageAdapter

- 내부적으로 MemoryAdapter 래핑
- 생성 시 `localStorage.getItem('__wd_vfs__')` 읽어 hydrate
- 변경마다 `_persist()` → `localStorage.setItem`
- `static isSupported(): boolean` — `isBrowser()` 기반

### IndexedDBAdapter

- `static async open(dbName?: string): Promise<IndexedDBAdapter>` 팩토리
- object store: `vfs_nodes`, key: path
- `onupgradeneeded`에서 스토어 생성
- `static isSupported(): boolean`

### path.ts (zero-dependency POSIX utils)

- `join(...parts)`, `dirname(path)`, `basename(path, ext?)`, `extname(path)`
- `normalize(path)` — `//`, `./`, `../` 해소
- `isAbsolute(path)`, `resolve(base, ...paths)`

### useFS

- `cwd` 상태 관리
- 상대 경로 → `path.resolve(cwd, relativePath)` 자동 변환
- `FSContextValue` 편의 메서드 제공

## 테스트

| 파일 | 테스트 항목 |
|------|------------|
| `MemoryAdapter.test.ts` | readFile/writeFile 왕복 |
| `MemoryAdapter.test.ts` | mkdir/readdir/unlink |
| `MemoryAdapter.test.ts` | ENOENT, EEXIST, EISDIR 오류 |
| `MemoryAdapter.test.ts` | watch 콜백 호출 |
| `MemoryAdapter.test.ts` | serialize/hydrate 왕복 |
| `LocalStorageAdapter.test.ts` | localStorage에 자동 저장 |
| `LocalStorageAdapter.test.ts` | 재생성 시 이전 상태 복원 |
| `path.test.ts` | join/normalize/dirname/basename 각 케이스 |

## 의존성

- `@windeath44/ssr`
- `@windeath44/react-kernel`
- peerDependencies: `react >=18`
