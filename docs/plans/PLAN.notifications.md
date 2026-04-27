# PLAN: @windeath44/notifications

## 목적

토스트 알림 큐 시스템. 여러 알림을 쌓아서 표시하고, 액션 버튼 및 자동 dismiss를 지원한다.

## 디렉터리 구조

```
packages/notifications/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts
    ├── types.ts
    ├── NotificationStore.ts    # Zustand 스토어
    ├── NotificationProvider.tsx
    ├── components/
    │   ├── ToastContainer.tsx  # 알림 목록 렌더
    │   └── Toast.tsx           # 단일 알림 컴포넌트
    ├── hooks/
    │   └── useNotifications.ts
    └── __tests__/
        ├── NotificationStore.test.ts
        └── useNotifications.test.tsx
```

## TypeScript Interfaces

```typescript
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
}

export interface Notification {
  id: string;                   // nanoid
  title: string;
  body?: string;
  icon?: string;
  type: NotificationType;
  actions?: NotificationAction[];
  duration?: number;            // ms, 0 = 수동 dismiss만
  createdAt: number;            // Date.now()
}

export type ShowNotificationOptions = Omit<Notification, 'id' | 'createdAt'>;

export interface NotificationsContextValue {
  notifications: Notification[];
  show(options: ShowNotificationOptions): string;  // id 반환
  dismiss(id: string): void;
  dismissAll(): void;
}
```

## 구현 상세

### NotificationStore

- `notifications: Notification[]` (최신이 앞)
- `show()`: nanoid id 생성 → prepend → duration > 0이면 setTimeout(dismiss) 등록
- `dismiss()`: 배열에서 제거
- timeout 참조는 `Map<string, ReturnType<typeof setTimeout>>`로 관리 (dismiss 시 clearTimeout)

### ToastContainer

- 화면 우하단 또는 우상단에 fixed 배치
- 알림 간 간격: `gap` 토큰 사용
- 진입/퇴장 CSS transition (opacity + translateY)

### Toast

- 타입별 색상 (`colorSuccess`, `colorWarning`, `colorDanger`, `colorPrimary`)
- 닫기 버튼 항상 표시
- actions[] → 버튼 렌더
- 스와이프로 dismiss (터치 이벤트 지원)

## 테스트

| 파일 | 테스트 항목 |
|------|------------|
| `NotificationStore.test.ts` | show 후 notifications 배열에 추가 |
| `NotificationStore.test.ts` | dismiss 후 제거 |
| `NotificationStore.test.ts` | duration 후 자동 dismiss (vi.useFakeTimers) |
| `NotificationStore.test.ts` | dismissAll 후 빈 배열 |
| `useNotifications.test.tsx` | show/dismiss 상태 반영 |

## 의존성

- `@windeath44/theme`
- peerDependencies: `react >=18`
