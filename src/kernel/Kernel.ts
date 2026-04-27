import { ProcessManager } from './process/ProcessManager';
import { KernelEventBus } from './ipc/KernelEventBus';
import type { SystemEventMap } from './ipc/SystemEventMap';
import type { SpawnOptions, Process } from './process/types';

export interface KernelConfig {
  features: Array<(kernel: Kernel) => void | Promise<void>>;
}

export class Kernel {
  readonly processManager: ProcessManager;
  readonly bus: KernelEventBus<SystemEventMap>;
  readonly initProcess: Process;

  private booted = false;

  constructor() {
    this.processManager = new ProcessManager();
    this.bus = new KernelEventBus<SystemEventMap>();

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

  async boot(config: KernelConfig): Promise<void> {
    if (this.booted) throw new Error('Kernel already booted');
    this.booted = true;

    for (const feature of config.features) {
      await feature(this);
    }

    this.bus.publish('desktop:ready', 0, {});
  }
}

let _kernel: Kernel | null = null;

export function getKernel(): Kernel {
  if (!_kernel) throw new Error('Kernel not initialized. Wrap your app in <KernelProvider>.');
  return _kernel;
}

export function initKernel(): Kernel {
  if (_kernel) throw new Error('Kernel already initialized.');
  _kernel = new Kernel();
  return _kernel;
}

export function _resetKernel(): void {
  _kernel = null;
}
