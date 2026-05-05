import type { SpawnOptions, Process } from './process/types';

export type AppKind = 'app' | 'service' | 'widget';

export interface AppManifest {
  id: string;
  name: string;
  displayName: string;
  version: string;
  kind: AppKind;
  icon?: string;
  entry: string; // 진입점 파일 경로
  autoStart?: boolean;
  dependencies?: string[];
  metadata?: Record<string, unknown>;
}

export interface AppRegistryEntry extends AppManifest {
  pid?: number;
  status: 'registered' | 'running' | 'stopped';
  component?: React.ComponentType<any>;
}

class AppRegistry {
  private apps = new Map<string, AppRegistryEntry>();
  private autoStartApps: string[] = [];

  register(manifest: AppManifest): void {
    if (this.apps.has(manifest.id)) {
      console.warn(`App "${manifest.id}" already registered`);
      return;
    }

    this.apps.set(manifest.id, {
      ...manifest,
      status: 'registered',
    });

    if (manifest.autoStart) {
      this.autoStartApps.push(manifest.id);
    }
  }

  unregister(id: string): void {
    this.apps.delete(id);
    this.autoStartApps = this.autoStartApps.filter(aid => aid !== id);
  }

  get(id: string): AppRegistryEntry | undefined {
    return this.apps.get(id);
  }

  getAll(): AppRegistryEntry[] {
    return Array.from(this.apps.values());
  }

  getAutoStartApps(): AppRegistryEntry[] {
    return this.autoStartApps
      .map(id => this.apps.get(id))
      .filter((app): app is AppRegistryEntry => app !== undefined);
  }

  // 디렉토리 기반 자동 탐색
  async scanDirectory(path: string): Promise<AppManifest[]> {
    const manifests: AppManifest[] = [];
    
    try {
      // Vite의 import.meta.glob 또는 webpack의 require.context 사용
      const modules = import.meta.glob(`${path}/**/index.tsx`, { eager: true });
      
      for (const [filePath, module] of Object.entries(modules)) {
        const dirName = filePath.replace(path + '/', '').replace('/index.tsx', '');
        const mod = module as any;
        
        if (mod.appManifest) {
          manifests.push({
            ...mod.appManifest,
            entry: filePath,
          });
        }
      }
    } catch (err) {
      console.error('Failed to scan app directory:', err);
    }
    
    return manifests;
  }

  updateStatus(id: string, status: AppRegistryEntry['status'], pid?: number): void {
    const app = this.apps.get(id);
    if (app) {
      app.status = status;
      if (pid !== undefined) app.pid = pid;
    }
  }
}

export const appRegistry = new AppRegistry();

// 편의 함수
export function registerApp(manifest: AppManifest): void {
  appRegistry.register(manifest);
}

export function getApp(id: string): AppRegistryEntry | undefined {
  return appRegistry.get(id);
}
