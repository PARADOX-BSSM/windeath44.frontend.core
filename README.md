# @windeath44/core

브라우저에서 동작하는 **웹 기반 OS 아키텍처 라이브러리**. TypeScript + React로 작성되었으며, 프로세스 관리, 윈도우 시스템, IPC, 라우팅, PDUI(선언적 UI) 등 데스크톱 OS 환경을 구축하는 데 필요한 모든 핵심 모듈을 제공한다.

## 설치

```bash
npm install @windeath44/core
# 또는
pnpm add @windeath44/core
```

React 18 이상이 peer dependency로 필요하다.

## 모듈

| 패키지 경로 | 역할 |
|-------------|------|
| `@windeath44/core` | Kernel, ProcessManager, KernelEventBus, AppRegistry |
| `@windeath44/core/react` | KernelProvider, useKernel, useProcess, useIPC 훅 |
| `@windeath44/core/window` | WindowManager, Window 컴포넌트, 드래그/리사이즈/zIndex 관리 |
| `@windeath44/core/shell` | Desktop, WindowLayer, DisplayProvider, ScaleProvider |
| `@windeath44/core/router` | ViewManager — 앱 내 뷰 네비게이션 스택 관리 |
| `@windeath44/core/pdui` | PDUI — JSON으로 정의된 선언적 UI를 React 컴포넌트로 렌더링 |
| `@windeath44/core/notifications` | 토스트 알림 시스템 |
| `@windeath44/core/context-menu` | 우클릭 컨텍스트 메뉴 |
| `@windeath44/core/drag-drop` | 포인터 기반 드래그 앤 드롭 |
| `@windeath44/core/theme` | 테마 프로바이더, 토큰 시스템 |
| `@windeath44/core/keyboard` | 키보드 단축키 바인딩 |
| `@windeath44/core/clipboard` | 클립보드 읽기/쓰기 |
| `@windeath44/core/vfs` | 가상 파일 시스템 (메모리/LocalStorage 어댑터) |
| `@windeath44/core/ssr` | SSR 가드, 직렬화 유틸리티 |
| `@windeath44/core/app-registry` | 앱 매니페스트 등록/조회 |

## 핵심 개념

### Kernel

모든 것의 중심. 프로세스 수명주기를 관리하고 부트 시퀀스를 실행한다.

```tsx
import { KernelProvider, useKernel } from '@windeath44/core/react';

function App() {
  return (
    <KernelProvider config={{ features: [shellFeature] }}>
      <Desktop />
    </KernelProvider>
  );
}
```

### Process

모든 기능은 Process 단위로 동작한다. 시스템 프로세스, 백그라운드 서비스, 사용자 앱으로 구분된다.

```tsx
const kernel = useKernel();
const proc = kernel.spawn({
  name: 'my-app',
  kind: 'app',
  parentPid: kernel.initProcess.pid,
  metadata: { displayName: '내 앱', version: '1.0.0' },
});
```

### Window

드래그, 리사이즈, 최소화, 최대화가 가능한 윈도우 시스템. 다중 창 앱을 위한 parent-child 추적과 cascade close를 지원한다.

```tsx
import { useWindowManager, useWindowId } from '@windeath44/core/window';

function MyApp() {
  const wm = useWindowManager();
  const windowId = useWindowId();

  wm.open({
    pid: myPid,
    parentWindowId: windowId,
    title: '서브 창',
    initialSize: { width: 400, height: 300 },
    children: <SubContent />,
  });
}
```

### IPC (Inter-Process Communication)

타입 안전한 이벤트 버스. 프로세스 kill 시 구독이 자동 해제된다.

```tsx
kernel.bus.publish('channel:event', senderPid, payload);
kernel.bus.subscribeAs(myPid, 'channel:event', (event) => { ... });
```

### PDUI (Portable Declarative UI)

JSON으로 UI를 정의하고 React 컴포넌트로 렌더링한다. 커스텀 위젯 레지스트리를 통해 앱별 UI 컴포넌트를 등록할 수 있다.

```tsx
import { PduiRenderer } from '@windeath44/core/pdui';

<PduiRenderer document={parsedDoc} handlers={handlers} data={data} />
```

### ViewManager

앱 내 뷰 네비게이션. 뷰 전환, 히스토리(back/forward), 초기 뷰 설정을 관리한다.

```tsx
import { ViewManagerProvider, useViewManager } from '@windeath44/core/router';

const vm = useViewManager();
vm.navigate('settings');
```

## 빌드

```bash
pnpm build        # tsup으로 ESM + CJS + 타입 선언 생성
pnpm test         # Vitest 단위 테스트
pnpm typecheck    # TypeScript 타입 체크
```

## 라이선스

MIT
