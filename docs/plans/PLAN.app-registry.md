# PLAN: @windeath44/app-registry

## 목적

앱 매니페스트 등록소. 각 앱이 자신을 등록하면 shell의 런처·도크·바탕화면 아이콘이
이 레지스트리를 조회해 앱 목록을 표시한다.

**Core 원칙**: 이 패키지는 등록·조회 API만 제공한다.
실제 앱 구현체는 포함하지 않는다.

## 디렉터리 구조

```
packages/app-registry/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts
    ├── types.ts
    ├── AppRegistry.ts
    ├── AppRegistryProvider.tsx
    ├── hooks/
    │   └── useAppRegistry.ts
    └── __tests__/
        └── AppRegistry.test.ts
```

## TypeScript Interfaces

```typescript
export type AppCategory =
  | 'system'
  | 'productivity'
  | 'media'
  | 'development'
  | 'utilities'
  | 'other';

export interface AppManifest {
  name: string;                        // 고유 식별자, e.g. "terminal"
  displayName: string;                 // 표시 이름
  version: string;
  description?: string;
  icon?: string;                       // URL 또는 data URI
  category: AppCategory;
  permissions?: string[];              // e.g. ["vfs:read", "vfs:write"]
  entryProcess: string;                // 프로세스 name, e.g. "terminal"
  // 앱 실행 함수 (KernelProvider 외부에서 호출)
  launch: (kernel: Kernel) => Process;
}

export interface AppRegistryContextValue {
  register(manifest: AppManifest): void;
  unregister(name: string): void;
  getByName(name: string): AppManifest | undefined;
  list(): AppManifest[];
  listByCategory(category: AppCategory): AppManifest[];
}
```

## 구현 상세

### AppRegistry 클래스

- `Map<string, AppManifest>` 내부 저장
- `register`: 중복 name 시 Error throw
- `unregister`: 미존재 시 silent (no-op)
- `list()`: 배열 스냅샷 반환

### AppRegistryProvider

- AppRegistry 인스턴스를 컨텍스트로 제공
- `KernelProvider` 안에 위치 권장

### 앱 등록 방법 (소비자 패키지에서)

```typescript
// apps/my-terminal/src/manifest.ts
import type { AppManifest } from '@windeath44/app-registry';

export const terminalManifest: AppManifest = {
  name: 'terminal',
  displayName: 'Terminal',
  version: '1.0.0',
  category: 'development',
  icon: '/icons/terminal.svg',
  entryProcess: 'terminal',
  launch: (kernel) => kernel.spawn({ name: 'terminal', kind: 'app', ... }),
};
```

## 테스트

| 파일 | 테스트 항목 |
|------|------------|
| `AppRegistry.test.ts` | register 후 getByName 반환 |
| `AppRegistry.test.ts` | 중복 name register → Error |
| `AppRegistry.test.ts` | unregister 후 getByName → undefined |
| `AppRegistry.test.ts` | listByCategory 필터링 |

## 의존성

- `@windeath44/react-kernel`
- peerDependencies: `react >=18`
