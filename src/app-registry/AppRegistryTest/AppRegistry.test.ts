import { describe, it, expect } from 'vitest';
import { AppRegistry } from '../AppRegistry';
import type { AppManifest } from '../types';

const base: AppManifest = {
  name: 'terminal',
  displayName: 'Terminal',
  version: '1.0.0',
  category: 'development',
  entryProcess: 'terminal',
  launch: () => ({ pid: 1, name: 'terminal', status: 'running', kind: 'app', parentPid: 1, metadata: { spawnedAt: '', displayName: 'Terminal', version: '1.0.0', packageId: 'terminal' } }),
};

const withRoute: AppManifest = {
  ...base,
  name: 'files',
  route: '/files',
  entryProcess: 'files',
};

describe('AppRegistry', () => {
  it('register then getByName returns manifest', () => {
    const r = new AppRegistry();
    r.register(base);
    expect(r.getByName('terminal')).toBe(base);
  });

  it('duplicate register throws', () => {
    const r = new AppRegistry();
    r.register(base);
    expect(() => r.register(base)).toThrow();
  });

  it('unregister removes manifest', () => {
    const r = new AppRegistry();
    r.register(base);
    r.unregister('terminal');
    expect(r.getByName('terminal')).toBeUndefined();
  });

  it('unregister non-existent is silent', () => {
    const r = new AppRegistry();
    expect(() => r.unregister('ghost')).not.toThrow();
  });

  it('list returns all manifests', () => {
    const r = new AppRegistry();
    r.register(base);
    r.register({ ...base, name: 'files', category: 'utilities' });
    expect(r.list()).toHaveLength(2);
  });

  it('listByCategory filters correctly', () => {
    const r = new AppRegistry();
    r.register(base);
    r.register({ ...base, name: 'vim', category: 'development' });
    r.register({ ...base, name: 'music', category: 'media' });
    expect(r.listByCategory('development')).toHaveLength(2);
    expect(r.listByCategory('media')).toHaveLength(1);
    expect(r.listByCategory('system')).toHaveLength(0);
  });

  it('getByRoute returns manifest with matching route', () => {
    const r = new AppRegistry();
    r.register(withRoute);
    expect(r.getByRoute('/files')).toBe(withRoute);
  });

  it('getByRoute returns undefined for non-existent route', () => {
    const r = new AppRegistry();
    r.register(base);
    expect(r.getByRoute('/terminal')).toBeUndefined();
  });

  it('unregister removes route from index', () => {
    const r = new AppRegistry();
    r.register(withRoute);
    r.unregister('files');
    expect(r.getByRoute('/files')).toBeUndefined();
  });

  it('register without route does not add to routeIndex', () => {
    const r = new AppRegistry();
    r.register(base);
    expect(r.getByRoute('/terminal')).toBeUndefined();
  });

  it('multiple apps with different routes', () => {
    const r = new AppRegistry();
    r.register(withRoute);
    r.register({ ...withRoute, name: 'settings', route: '/settings', entryProcess: 'settings' });
    expect(r.getByRoute('/files')).toBe(withRoute);
    expect(r.getByRoute('/settings')?.name).toBe('settings');
  });
});
