# PLAN: @windeath44/react-kernel

## 목적

커널과 IPC를 React 컴포넌트 트리에 연결하는 훅과 프로바이더.
`KernelProvider`가 싱글턴 커널을 생성하고 boot()를 실행한다.

## 디렉터리 구조

```
packages/react-kernel/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts
    ├── KernelProvider.tsx
    ├── useKernel.ts
    ├── useProcess.ts
    ├── useProcessList.ts
    ├── useIPC.ts
    └── __tests__/
        ├── useProcess.test.tsx
        ├── useProcessList.test.tsx
        └── useIPC.test.tsx
```

## TypeScript Interfaces

```typescript
// KernelProvider props
interface KernelProviderProps {
  config: KernelConfig;
  children: ReactNode;
  fallback?: ReactNode;   // 커널 부팅 중 보여줄 UI
}

// useIPCSubscribe — 채널 구독 (언마운트 시 자동 해제)
function useIPCSubscribe<K extends keyof SystemEventMap & string>(
  pid: number,
  channel: K,
  handler: ChannelHandler<SystemEventMap[K]>,
): void;

// useIPCPublish — 안정적인 publish 함수 반환
function useIPCPublish<K extends keyof SystemEventMap & string>(
  senderPid: number,
  channel: K,
): (payload: SystemEventMap[K]) => IPCEvent<SystemEventMap[K]>;
```

## 구현 상세

### KernelProvider

- `useMemo` 내에서 `initKernel()` — 마운트당 한 번
- `useEffect`에서 `kernel.boot(config)` → `setBooted(true)`
- 부팅 중: `fallback` 렌더, 완료 후: `children` 렌더
- `config`는 의도적으로 deps 배열에서 제외 (boot는 one-shot)

### useProcess(pid)

- `useState` 초기값: `kernel.processManager.get(pid)`
- `useEffect`에서 `processManager.subscribe` → pid 일치 시 상태 업데이트
- kill 이벤트 시 `undefined` 설정

### useProcessList()

- process 이벤트 수신 시마다 `processManager.list()` 스냅샷으로 갱신

### useIPCSubscribe(pid, channel, handler)

- `useEffect`에서 `bus.subscribeAs(pid, channel, handler)`
- cleanup에서 `bus.unsubscribe(token)`
- handler는 deps에서 제외 — 호출부에서 `useCallback`으로 안정화 책임

## 테스트

| 파일 | 테스트 항목 |
|------|------------|
| `useProcess.test.tsx` | spawn 후 프로세스 반환, kill 후 undefined 반환 |
| `useProcess.test.tsx` | 언마운트 시 구독 해제 (메모리 누수 없음) |
| `useProcessList.test.tsx` | spawn/kill 시 리스트 자동 갱신 |
| `useIPC.test.tsx` | publish 시 subscribe 핸들러 호출 |
| `useIPC.test.tsx` | 언마운트 시 자동 unsubscribe |

## 의존성

- `@windeath44/kernel`
- peerDependencies: `react >=18`
