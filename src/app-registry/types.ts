import type { Process } from '../kernel/process/types';
import type { Kernel } from '../kernel/Kernel';

export type AppCategory = 'system' | 'productivity' | 'media' | 'development' | 'utilities' | 'other';

export interface AppManifest {
  /** 고유 식별자, e.g. "terminal" */
  name: string;
  displayName: string;
  version: string;
  description?: string;
  /** URL 또는 data URI */
  icon?: string;
  category: AppCategory;
  permissions?: string[];
  /** Kernel.spawn에 전달할 프로세스 이름 */
  entryProcess: string;
  launch: (kernel: Kernel) => Process;
}

export interface AppRegistryContextValue {
  register(manifest: AppManifest): void;
  unregister(name: string): void;
  getByName(name: string): AppManifest | undefined;
  list(): AppManifest[];
  listByCategory(category: AppCategory): AppManifest[];
}
