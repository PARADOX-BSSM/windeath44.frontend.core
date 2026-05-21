<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-22 | Updated: 2026-05-22 -->

# core/src/notifications

## Purpose
시스템 알림 모듈. 토스트 형태의 알림을 표시하고 관리한다. `@windeath44/core/notifications` subpath로 export. 상세 API: `packages/core/docs/notifications.md`.

## Key Files

| File | Description |
|------|-------------|
| `NotificationProvider.tsx` | 알림 Context + Provider |
| `NotificationStore.ts` | 알림 상태 저장소 |
| `index.ts` | public API: NotificationProvider, useNotifications |
| `types.ts` | Notification, NotificationType 타입 |

## For AI Agents

### Common Patterns
```typescript
import { useNotifications } from '@windeath44/core/notifications';

const { show } = useNotifications();
show({ title: '저장 완료', type: 'success' });
show({ title: '오류 발생', type: 'error', body: '자세한 내용...' });
```

<!-- MANUAL: -->
