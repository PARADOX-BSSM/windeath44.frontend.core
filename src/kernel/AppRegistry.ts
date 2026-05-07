export type AppKind = 'app' | 'service' | 'widget';

export type RenderMode = 'shell' | 'window' | 'hidden';

export interface AppManifest {
  id: string;
  name: string;
  displayName: string;
  version: string;
  kind: AppKind;
  renderMode?: RenderMode;
  shellRole?: string;
  singleton?: boolean;
  icon?: string;
  entry?: string;
  autoStart?: boolean;
  dependencies?: string[];
  metadata?: Record<string, unknown>;
}

export interface AppRegistryEntry extends AppManifest {
  pid?: number;
  status: 'registered' | 'running' | 'stopped';
  component?: React.ComponentType<any>;
}

export class AppRegistry {
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

  updateStatus(id: string, status: AppRegistryEntry['status'], pid?: number): void {
    const app = this.apps.get(id);
    if (app) {
      app.status = status;
      if (pid !== undefined) app.pid = pid;
    }
  }
}

export const appRegistry = new AppRegistry();

export function registerApp(manifest: AppManifest): void {
  appRegistry.register(manifest);
}

export function getApp(id: string): AppRegistryEntry | undefined {
  return appRegistry.get(id);
}
