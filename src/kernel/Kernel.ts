import { ProcessManager } from './process/ProcessManager';
import { KernelEventBus } from './ipc/KernelEventBus';
import type { SystemEventMap } from './ipc/SystemEventMap';
import type { SpawnOptions, Process } from './process/types';
import { AppRegistry, type AppManifest } from './AppRegistry';

export interface KernelConfig {
  features: Array<(kernel: Kernel) => void | Promise<void>>;
  apps?: AppManifest[];
}

export class Kernel {
  readonly processManager: ProcessManager;
  readonly bus: KernelEventBus<SystemEventMap>;
  readonly initProcess: Process;
  readonly appRegistry: AppRegistry;

  private booted = false;

  constructor() {
    this.processManager = new ProcessManager();
    this.bus = new KernelEventBus<SystemEventMap>();
    this.appRegistry = new AppRegistry();

    this.processManager.subscribe((evt) => {
      const { pid, name } = evt.process;
      switch (evt.type) {
        case 'spawn':
          this.bus.publish('process:spawned', 0, { pid, name });
          break;
        case 'kill':
          this.bus.publish('process:killed', 0, { pid });
          this.bus.purge(pid);
          break;
        case 'suspend':
          this.bus.publish('process:suspended', 0, { pid });
          break;
        case 'resume':
          this.bus.publish('process:resumed', 0, { pid });
          break;
        case 'ready':
          this.bus.publish('process:ready', 0, { pid });
          break;
      }
    });

    this.initProcess = this.processManager.spawn({
      name: 'init',
      kind: 'system',
      parentPid: undefined,
      metadata: {
        displayName: 'Kernel Init',
        version: '0.1.0',
        packageId: 'windeath44.core',
      },
    });
  }

  spawn(options: SpawnOptions): Process {
    return this.processManager.spawn(options);
  }

  markReady(pid: number): void {
    this.processManager.markReady(pid);
  }

  findProcessByPackageId(packageId: string): Process | undefined {
    return this.processManager.findByPackageId(packageId);
  }

  registerApp(manifest: AppManifest): void {
    this.appRegistry.register(manifest);
  }

  async boot(config: KernelConfig): Promise<void> {
    if (this.booted) return;
    this.booted = true;

    // 앱 등록
    if (config.apps) {
      for (const app of config.apps) {
        this.registerApp(app);
      }
    }

    // 피처 로드
    for (const feature of config.features) {
      await feature(this);
    }

    // 자동 시작 앱 실행
    await this.startAutoStartApps();

    this.bus.publish('desktop:ready', 0, {});
  }

  private async startAutoStartApps(): Promise<void> {
    const apps = this.appRegistry.getAutoStartApps();
    
    // 의존성 순서로 정렬
    const order = this.resolveDependencies(apps.map(a => a.id));
    
    for (const id of order) {
      const app = this.appRegistry.get(id);
      if (!app || app.status === 'running') continue;

      try {
        const proc = this.spawn({
          name: app.name,
          kind: app.kind === 'service' ? 'service' : 'app',
          parentPid: this.initProcess.pid,
          metadata: {
            displayName: app.displayName,
            version: app.version,
            packageId: app.id,
            ...app.metadata,
          },
        });

        this.appRegistry.updateStatus(id, 'running', proc.pid);
        this.bus.publish('app:started', 0, { appId: id, pid: proc.pid });
      } catch (err) {
        console.error(`Failed to start app "${id}":`, err);
      }
    }
  }

  private resolveDependencies(appIds: string[]): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (id: string, path: string[] = []) => {
      if (visiting.has(id)) {
        throw new Error(`Circular dependency: ${path.join(' -> ')} -> ${id}`);
      }
      if (visited.has(id)) return;

      const app = this.appRegistry.get(id);
      if (!app) throw new Error(`Unknown app: ${id}`);

      visiting.add(id);
      for (const dep of app.dependencies || []) {
        visit(dep, [...path, id]);
      }
      visiting.delete(id);
      visited.add(id);
      order.push(id);
    };

    for (const id of appIds) {
      visit(id);
    }

    return order;
  }
}

let _kernel: Kernel | null = null;

export function getKernel(): Kernel {
  if (!_kernel) throw new Error('Kernel not initialized. Wrap your app in <KernelProvider>.');
  return _kernel;
}

export function initKernel(): Kernel {
  _kernel ??= new Kernel();
  return _kernel;
}

export function _resetKernel(): void {
  _kernel = null;
}
