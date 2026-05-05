// 시스템 전역 IPC 채널 타입
// feature 모듈은 declaration merging으로 이 인터페이스를 확장한다:
//
//   declare module 'windeath44.core' {
//     interface SystemEventMap {
//       'fs:changed': { path: string };
//     }
//   }

import type { EventMap } from './types';

export interface SystemEventMap extends EventMap {
  'process:spawned': { pid: number; name: string };
  'process:killed': { pid: number };
  'process:suspended': { pid: number };
  'process:resumed': { pid: number };

  'window:open': { pid: number; title: string };
  'window:close': { pid: number };
  'window:focus': { pid: number };
  'window:minimize': { pid: number };

  'desktop:ready': Record<string, never>;

  'app:message': { fromPid: number; toPid: number; payload: unknown };
  'app:started': { appId: string; pid: number };
}
