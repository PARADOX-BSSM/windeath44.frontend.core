<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-22 | Updated: 2026-05-22 -->

# core/src/react

## Purpose
커널과 React의 통합 레이어. `KernelProvider`로 커널을 React 트리에 주입하고, 앱/서비스가 커널 기능을 훅으로 사용할 수 있게 한다. **모든 windeath44 앱은 이 모듈의 훅을 기반으로 동작한다.**

## Key Files

| File | Description |
|------|-------------|
| `KernelProvider.tsx` | 커널 React Context 제공자 — 앱 최상위에 단 한 번만 배치 |
| `useIPC.ts` | `useIPCSubscribe`, `useIPCPublish` — IPC 통신 훅 |
| `useProcess.ts` | `useProcess` — 현재 프로세스 정보 훅 |
| `useProcessList.ts` | `useProcessList` — 전체 프로세스 목록 훅 |
| `index.ts` | public API: KernelProvider, useKernel, useMarkReady, useProcess, useIPCSubscribe, useIPCPublish |
| `README.md` | React 통합 패턴 설명 |

## For AI Agents

### Working In This Directory
- `useMarkReady(pid)` — 앱이 초기화 완료를 커널에 알리는 훅. 각 앱 컴포넌트 mount 시 호출 필수.
- `useIPCPublish(pid, channel)` → 발행 함수 반환.
- `useIPCSubscribe(pid, channel, handler)` → 자동 구독/해제.
- `useKernel()` — 커널 직접 접근 (고급 사용, 일반적으로 상위 훅 사용 권장).

### Common Patterns
```typescript
import { useMarkReady, useIPCSubscribe, useIPCPublish } from '@windeath44/core/react';

function MyApp({ pid }: { pid?: number }) {
  const markReady = useMarkReady();
  useEffect(() => { if (pid) markReady(pid); }, [pid]);

  const publish = useIPCPublish(pid!, 'my:event');
  useIPCSubscribe(pid!, 'other:event', (event) => { /* handle */ });
}
```

## Dependencies

### Internal
- `../kernel` — Kernel, ProcessManager, KernelEventBus

### External
- React 18 (Context, hooks)

<!-- MANUAL: -->
