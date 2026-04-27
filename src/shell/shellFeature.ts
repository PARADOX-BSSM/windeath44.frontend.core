import type { Kernel } from '../kernel/Kernel';

export function shellFeature(kernel: Kernel): void {
  kernel.spawn({
    name: 'shell',
    kind: 'system',
    parentPid: kernel.initProcess.pid,
    metadata: {
      displayName: 'Shell',
      version: '0.1.0',
      packageId: 'windeath44.core/shell',
    },
  });
}
