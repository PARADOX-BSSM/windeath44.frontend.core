# PLAN: IPC (Inter-Process Communication)

## 목적

프로세스 간 직접 참조 없이 타입 안전하게 메시지를 주고받는 이벤트 버스.
`packages/kernel/src/ipc/` 서브디렉터리에 위치하며 kernel 패키지의 일부로 빌드된다.

## 디렉터리 구조

```
packages/kernel/src/ipc/
├── types.ts
├── EventBus.ts
├── KernelEventBus.ts
├── SystemEventMap.ts
└── __tests__/
    ├── EventBus.test.ts
    └── KernelEventBus.test.ts
```

## TypeScript Interfaces

### `ipc/types.ts`

```typescript
// 사용자 정의 채널맵 — 채널명 → 페이로드 타입
export type EventMap = Record<string, unknown>;

export interface IPCEvent<TPayload = unknown> {
  channel: string;
  senderPid: number;
  payload: TPayload;
  seq: number;       // 단조 증가 시퀀스
  timestamp: string; // ISO-8601
}

export type ChannelHandler<TPayload> = (event: IPCEvent<TPayload>) => void;

export interface SubscriptionToken {
  readonly channel: string;
  readonly id: symbol;
}
```

### `ipc/SystemEventMap.ts`

```typescript
// 시스템 전역 채널 타입 — declaration merging으로 feature 패키지가 확장
export interface SystemEventMap {
  'process:spawned':   { pid: number; name: string };
  'process:killed':    { pid: number };
  'process:suspended': { pid: number };
  'process:resumed':   { pid: number };
  'window:open':       { pid: number; title: string };
  'window:close':      { pid: number };
  'window:focus':      { pid: number };
  'window:minimize':   { pid: number };
  'desktop:ready':     Record<string, never>;
  'app:message':       { fromPid: number; toPid: number; payload: unknown };
}
```

## 구현 상세

### EventBus\<TMap\>

- `publish<K>(channel, senderPid, payload)` → 동기 dispatch, `IPCEvent` 반환
- `subscribe<K>(channel, handler)` → `SubscriptionToken` 반환
- `unsubscribe(token)` → 핸들러 제거
- 핸들러 내부에서 subscribe/unsubscribe 호출 안전성: dispatch 전 Set 스냅샷

### KernelEventBus\<TMap\> (extends EventBus)

- `subscribeAs(pid, channel, handler)` — pid 인덱스에 토큰 등록
- `purge(pid)` — 해당 pid의 모든 구독 일괄 해제 (프로세스 kill 시 Kernel이 호출)
- `pidIndex: Map<number, SubscriptionToken[]>`

### Declaration Merging 사용법

```typescript
// packages/vfs/src/index.ts
declare module '@windeath44/kernel' {
  interface SystemEventMap {
    'fs:changed': { path: string };
    'fs:error':   { path: string; code: string };
  }
}
```

## 테스트

| 파일 | 테스트 항목 |
|------|------------|
| `EventBus.test.ts` | publish 후 subscribe 핸들러 호출 확인 |
| `EventBus.test.ts` | unsubscribe 후 핸들러 미호출 |
| `EventBus.test.ts` | seq 단조 증가 |
| `EventBus.test.ts` | 핸들러 내에서 subscribe 호출 시 무한루프 없음 |
| `EventBus.test.ts` | 다중 채널 구독 독립성 |
| `KernelEventBus.test.ts` | subscribeAs + purge(pid) 후 핸들러 미호출 |
| `KernelEventBus.test.ts` | 다른 pid의 구독은 purge 영향 없음 |

## 의존성

- kernel 패키지 내부 모듈 (별도 패키지 없음)
