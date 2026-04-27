# windeath44.core/vfs

어댑터 패턴 기반 가상 파일 시스템. POSIX 경로, 워처, serialize/hydrate 지원.

## Import

```typescript
import { VFSProvider, useFS, MemoryAdapter } from 'windeath44.core/vfs';
```

## 기본 사용법

```tsx
import { VFSProvider, useFS, MemoryAdapter } from 'windeath44.core/vfs';

function App() {
  return (
    <VFSProvider adapter={new MemoryAdapter()} initialCwd="/home">
      <FileManager />
    </VFSProvider>
  );
}

function FileManager() {
  const { adapter, cwd, resolvePath } = useFS();

  async function createFile() {
    await adapter.writeFile(resolvePath('notes.txt'), 'Hello!');
  }

  return <button onClick={createFile}>파일 만들기</button>;
}
```

## 어댑터

| 어댑터 | 설명 |
|--------|------|
| `MemoryAdapter` | 인메모리, SSR 안전 |
| `LocalStorageAdapter` | MemoryAdapter + localStorage 자동 저장/복원 |

```typescript
// LocalStorage
import { LocalStorageAdapter } from 'windeath44.core/vfs';
if (LocalStorageAdapter.isSupported()) {
  const fs = new LocalStorageAdapter(); // 이전 상태 자동 복원
}
```

## IFileSystemAdapter API

```typescript
await fs.readFile(path)
await fs.writeFile(path, content, mkdirp?)  // mkdirp=true: 부모 디렉터리 자동 생성
await fs.unlink(path)
await fs.mkdir(path, exist_ok?)
await fs.rmdir(path, recursive?)
await fs.readdir(path)   // → FileNode[] (직접 자식만)
await fs.stat(path)      // → FileNode
await fs.exists(path)    // → boolean
await fs.rename(src, dst)
await fs.copy(src, dst)
fs.watch(path, cb, recursive?)  // → unsubscribe 함수
fs.serialize()   // → SerializedFS
fs.hydrate(data)
```

## VFS 에러

```typescript
import { VFSError } from 'windeath44.core/vfs';

try {
  await fs.readFile('/missing');
} catch (e) {
  if (e instanceof VFSError) {
    console.log(e.code); // 'ENOENT'
  }
}
```

에러 코드: `ENOENT` `EEXIST` `ENOTDIR` `EISDIR` `ENOTEMPTY` `EPERM`

## 경로 유틸

```typescript
import { vfsPath } from 'windeath44.core/vfs';

vfsPath.join('/home', 'user', 'docs')    // '/home/user/docs'
vfsPath.dirname('/home/user/docs')       // '/home/user'
vfsPath.basename('/home/user/docs/a.txt') // 'a.txt'
vfsPath.extname('/home/user/docs/a.txt') // '.txt'
vfsPath.normalize('/a//b/../c')          // '/a/c'
vfsPath.resolve('/home', 'user')         // '/home/user'
```

## Tests

```
src/vfs/VFSTest/
├── path.test.ts               — 14 tests
├── MemoryAdapter.test.ts      — 18 tests
└── LocalStorageAdapter.test.ts — 5 tests (jsdom localStorage)
```
