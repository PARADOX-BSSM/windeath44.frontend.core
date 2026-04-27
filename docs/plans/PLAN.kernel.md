# PLAN: @windeath44/kernel

## 목적

프로세스 수명주기 관리와 시스템 부트스트랩을 담당하는 OS 코어.
모든 기능은 Process 단위로 모델링되며, Kernel이 유일한 진입점이다.

## 디렉터리 구조

```
packages/kernel/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts
    ├── Kernel.ts
    ├── process/
    │   ├── types.ts
    │   ├── ProcessManager.ts
    │   └── index.ts
    └── __tests__/
        ├── ProcessManager.test.ts
        └── Kernel.test.ts
```

## TypeScript Interfaces

### `src/process/types.ts`

```typescript
export type ProcessStatus = 'running' | 'suspended' | 'killed';
export type ProcessKind = 'system' | 'service' | 'app';

export interface ProcessMetadata {
  displayName: string;
  icon?: string;
  version: string;
  packageId: string;
  spawnedAt: string;        // ISO-8601
  extra?: Record<string, unknown>;
}

export interface Process {
  pid: number;              // 1부터 단조 증가
  name: string;             // 짧은 식별자, e.g. "desktop"
  status: ProcessStatus;
  kind: ProcessKind;
  parentPid: number | undefined;
  metadata: ProcessMetadata;
}

export interface SpawnOptions {
  name: string;
  kind: ProcessKind;
  parentPid?: number;
  metadata: Omit<ProcessMetadata, 'spawnedAt'>;
}
```

### `src/Kernel.ts`

```typescript
export interface KernelConfig {
  // 각 feature가 커널을 받아 프로세스를 spawn하거나 설정을 등록하는 함수
  features: Array<(kernel: Kernel) => void | Promise<void>>;
}

export class Kernel {
  readonly processManager: ProcessManager;
  readonly bus: KernelEventBus<SystemEventMap>;
  readonly initProcess: Process;  // pid=0, kind='system'

  spawn(options: SpawnOptions): Process;
  async boot(config: KernelConfig): Promise<void>;
}

export function getKernel(): Kernel;   // 미초기화 시 throw
export function initKernel(): Kernel;  // 중복 호출 시 throw
```

## 구현 상세

### ProcessManager

- `nextPid` 카운터: 1부터 시작 (0은 initProcess 예약)
- `processes: Map<number, Process>` — immutable value object 패턴
- 모든 변경은 spread copy → map에 재저장 (React 상태와 호환)
- `kind === 'system'`인 프로세스는 kill 거부 → Error throw
- 리스너는 `Set<ProcessListener>`로 관리, subscribe() → unsubscribe 함수 반환

### Kernel.boot() 순서

1. `booted` 플래그 검사 (중복 boot 방지)
2. `features[]`를 순서대로 await
3. IPC로 `'process:spawned'` 이벤트 자동 발행 (ProcessManager 리스너에서)
4. 부트 완료 후 `'desktop:ready'` 발행

### IPC 연결

ProcessManager의 subscribe 콜백 안에서 KernelEventBus에 자동 발행:
- spawn → `'process:spawned'`
- kill → `'process:killed'` + `bus.purge(pid)`
- suspend → `'process:suspended'`
- resume → `'process:resumed'`

## 테스트

| 파일 | 테스트 항목 |
|------|------------|
| `ProcessManager.test.ts` | spawn 후 list에 포함 확인 |
| `ProcessManager.test.ts` | kill 후 list에서 제거 |
| `ProcessManager.test.ts` | system 프로세스 kill 시 Error throw |
| `ProcessManager.test.ts` | suspend/resume 상태 전이 |
| `ProcessManager.test.ts` | subscribe 콜백 호출 확인 |
| `ProcessManager.test.ts` | unsubscribe 후 콜백 미호출 확인 |
| `Kernel.test.ts` | boot() features 순서대로 실행 |
| `Kernel.test.ts` | boot() 중복 호출 시 Error throw |
| `Kernel.test.ts` | getKernel() 미초기화 시 Error throw |

## 의존성

- `@windeath44/ssr` (isBrowser 가드)
- peerDependencies 없음 (React-free 코어)
