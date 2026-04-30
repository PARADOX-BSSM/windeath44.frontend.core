import type { Kernel } from '../kernel/Kernel';
import { AppRegistry } from '../app-registry/AppRegistry';
import type { AppManifest } from '../app-registry/types';

export interface NavigationFeatureOptions {
  registry: AppRegistry;
  manifests?: AppManifest[];
}

export function navigationFeature(options: NavigationFeatureOptions): (kernel: Kernel) => void {
  const { registry, manifests } = options;

  return (kernel: Kernel) => {
    if (manifests) {
      for (const manifest of manifests) {
        registry.register(manifest);
      }
    }

    kernel.spawn({
      name: 'navigation',
      kind: 'system',
      parentPid: kernel.initProcess.pid,
      metadata: {
        displayName: 'Navigation',
        version: '0.1.0',
        packageId: 'windeath44.core/router',
      },
    });
  };
}