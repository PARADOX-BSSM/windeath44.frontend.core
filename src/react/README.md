# windeath44.core/react

커널을 React 컴포넌트 트리에 연결하는 Provider와 훅.

## Import

```typescript
import {
  KernelProvider,
  useKernel,
  useProcess,
  useProcessList,
  useIPCSubscribe,
  useIPCPublish,
} from 'windeath44.core/react';
```

## KernelProvider

앱 최상위에서 커널을 초기화하고 boot 순서를 실행한다.

```tsx
import { KernelProvider } from 'windeath44.core/react';

function App() {
  return (
    <KernelProvider
      config={{
        features: [
          (kernel) => kernel.spawn({ name: 'shell', kind: 'system', ... }),
          (kernel) => kernel.spawn({ name: 'my-service', kind: 'service', ... }),
        ],
      }}
      fallback={<SplashScreen />}
    >
      <Desktop />
    </KernelProvider>
  );
}
```

- `config.features`: boot 시 순서대로 실행되는 함수 배열
- `fallback`: 커널 boot 완료 전 렌더할 UI (선택)

## useKernel

커널 인스턴스 직접 접근. `KernelProvider` 외부에서 호출하면 throw.

```typescript
const kernel = useKernel();
kernel.spawn({ ... });
kernel.processManager.list();
```

## useProcess(pid)

특정 pid의 프로세스 상태를 구독. kill 시 `undefined` 반환.

```typescript
function MyComponent({ pid }: { pid: number }) {
  const proc = useProcess(pid);
  if (!proc) return <div>Process terminated</div>;
  return <div>{proc.metadata.displayName} — {proc.status}</div>;
}
```

## useProcessList()

전체 프로세스 목록 구독. spawn/kill/suspend/resume 시 자동 리렌더.

```typescript
function Taskbar() {
  const processes = useProcessList();
  const apps = processes.filter(p => p.kind === 'app');
  return <ul>{apps.map(p => <li key={p.pid}>{p.metadata.displayName}</li>)}</ul>;
}
```

## useIPCSubscribe(pid, channel, handler)

IPC 채널 구독. 언마운트 시 자동 해제.

```typescript
function MyWindow({ pid }: { pid: number }) {
  const handleFocus = useCallback((event) => {
    console.log('focused:', event.payload.pid);
  }, []);

  useIPCSubscribe(pid, 'window:focus', handleFocus);
  return <div>...</div>;
}
```

- `handler`는 `useCallback`으로 안정화할 것

## useIPCPublish(senderPid, channel)

안정적인 publish 함수 반환.

```typescript
function MyButton({ pid }: { pid: number }) {
  const openWindow = useIPCPublish(pid, 'window:open');

  return (
    <button onClick={() => openWindow({ pid, title: 'My App' })}>
      Open Window
    </button>
  );
}
```

## Tests

```
src/react/ReactTest/
├── KernelProvider.test.tsx  — 5 tests
├── useProcess.test.tsx      — 2 tests
├── useProcessList.test.tsx  — 3 tests
└── useIPC.test.tsx          — 3 tests
```

```bash
pnpm test
```
