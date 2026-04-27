export type ProcessStatus = 'running' | 'suspended' | 'killed';

export type ProcessKind =
  | 'system'   // 커널 수준, 사용자 kill 불가
  | 'service'  // 백그라운드, UI 없음
  | 'app';     // 사용자 앱, 윈도우 보유

export interface ProcessMetadata {
  displayName: string;
  icon?: string;
  version: string;
  packageId: string;
  spawnedAt: string;
  extra?: Record<string, unknown>;
}

export interface Process {
  pid: number;
  name: string;
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
