import { describe, it, expect } from 'vitest';
import { resolveSSRApp } from '../resolveApp';
import { AppRegistry } from '../../app-registry/AppRegistry';
import type { AppManifest } from '../../app-registry/types';

const base: AppManifest = {
  name: 'terminal',
  displayName: 'Terminal',
  version: '1.0.0',
  category: 'development',
  entryProcess: 'terminal',
  route: '/terminal',
  launch: () => ({ pid: 1, name: 'terminal', status: 'running', kind: 'app', parentPid: 0, metadata: { spawnedAt: '', displayName: 'Terminal', version: '1.0.0', packageId: 'terminal' } }),
};

const files: AppManifest = {
  name: 'files',
  displayName: 'Files',
  version: '1.0.0',
  category: 'utilities',
  entryProcess: 'files',
  route: '/files',
  launch: () => ({ pid: 2, name: 'files', status: 'running', kind: 'app', parentPid: 0, metadata: { spawnedAt: '', displayName: 'Files', version: '1.0.0', packageId: 'files' } }),
};

describe('resolveSSRApp', () => {
  it('returns matching manifest for exact route', () => {
    const registry = new AppRegistry();
    registry.register(base);
    registry.register(files);

    const result = resolveSSRApp({ registry, url: '/terminal' });
    expect(result.manifest?.name).toBe('terminal');
    expect(result.params).toEqual({});
  });

  it('returns null for unmatched route', () => {
    const registry = new AppRegistry();
    registry.register(base);

    const result = resolveSSRApp({ registry, url: '/unknown' });
    expect(result.manifest).toBeNull();
    expect(result.params).toEqual({});
  });

  it('strips query string from URL', () => {
    const registry = new AppRegistry();
    registry.register(base);

    const result = resolveSSRApp({ registry, url: '/terminal?arg=value' });
    expect(result.manifest?.name).toBe('terminal');
  });

  it('returns empty result for empty registry', () => {
    const registry = new AppRegistry();

    const result = resolveSSRApp({ registry, url: '/terminal' });
    expect(result.manifest).toBeNull();
  });

  it('ignores apps without route', () => {
    const registry = new AppRegistry();
    const noRoute: AppManifest = {
      name: 'hidden',
      displayName: 'Hidden',
      version: '1.0.0',
      category: 'system',
      entryProcess: 'hidden',
      launch: () => ({ pid: 3, name: 'hidden', status: 'running', kind: 'app', parentPid: 0, metadata: { spawnedAt: '', displayName: 'Hidden', version: '1.0.0', packageId: 'hidden' } }),
    };
    registry.register(noRoute);
    registry.register(base);

    const result = resolveSSRApp({ registry, url: '/hidden' });
    expect(result.manifest).toBeNull();
  });

  it('matches first registered route', () => {
    const registry = new AppRegistry();
    registry.register(base);
    registry.register(files);

    const result = resolveSSRApp({ registry, url: '/files' });
    expect(result.manifest?.name).toBe('files');
  });
});