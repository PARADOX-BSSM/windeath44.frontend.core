# windeath44.core — Kernel

OS 코어. 프로세스 수명주기 관리(ProcessManager), 타입 안전 IPC(EventBus), 부트스트랩(Kernel)을 포함한다.

## Import

```typescript
import {
  Kernel,
  initKernel,
  getKernel,
  ProcessManager,
  EventBus,
  KernelEventBus,
} from 'windeath44.core';
```

## Concepts

### Process

모든 기능은 `Process` 단위로 동작한다.

```typescript
interface Process {
  pid: number;
  name: string;
  status: 'running' | 'suspended' | 'killed';
  kind: 'system' | 'service' | 'app';
  parentPid: number | undefined;
  metadata: ProcessMetadata;
}
```

- `system`: 커널 수준, kill 불가
- `service`: 백그라운드 서비스, UI 없음
- `app`: 사용자 앱, 윈도우 보유

### Kernel

싱글턴 커널. `KernelProvider`(React 바인딩)가 생성을 담당하며, 직접 `initKernel()`을 호출할 수도 있다.

```typescript
const kernel = initKernel();

await kernel.boot({
  features: [
    (k) => k.spawn({ name: 'shell', kind: 'system', ... }),
    (k) => k.spawn({ name: 'my-service', kind: 'service', ... }),
  ],
});
// boot 완료 후 'desktop:ready' IPC 이벤트 발행됨
```

### ProcessManager

```typescript
const pm = kernel.processManager;

const proc = pm.spawn({ name: 'worker', kind: 'app', metadata: { ... } });
pm.suspend(proc.pid);
pm.resume(proc.pid);
pm.kill(proc.pid);

const all = pm.list();        // ReadonlyArray<Process>
const p   = pm.get(proc.pid); // Process | undefined

const unsub = pm.subscribe((event) => {
  // event.type: 'spawn' | 'kill' | 'suspend' | 'resume' | 'status-change'
  // event.process: Process
});
unsub(); // 구독 해제
```

### IPC — EventBus / KernelEventBus

```typescript
// 발행
kernel.bus.publish('window:open', senderPid, { pid: 42, title: 'My App' });

// 구독 (일반)
const token = kernel.bus.subscribe('window:open', (event) => {
  console.log(event.payload.pid);
});
kernel.bus.unsubscribe(token);

// 구독 (pid 태그 — 프로세스 kill 시 자동 해제)
kernel.bus.subscribeAs(myPid, 'window:open', handler);
// kill 시 kernel이 자동으로 bus.purge(myPid) 호출
```

### SystemEventMap 확장 (Declaration Merging)

feature 모듈에서 자신의 IPC 채널을 추가할 수 있다:

```typescript
// src/vfs/index.ts
declare module 'windeath44.core' {
  interface SystemEventMap {
    'fs:changed': { path: string };
    'fs:error':   { path: string; code: string };
  }
}
```

## Tests

```
src/kernel/KernelTest/
├── ProcessManager.test.ts  — 13 tests
├── EventBus.test.ts        — 7 tests
├── KernelEventBus.test.ts  — 4 tests
└── Kernel.test.ts          — 9 tests
```

```bash
pnpm test
# JSON 결과: logs/test-results.log
```
