import { describe, it, expect, vi } from 'vitest';
import { ProcessManager } from '../process/ProcessManager';

function makeManager() {
  return new ProcessManager();
}

const baseOptions = {
  name: 'test',
  kind: 'app' as const,
  metadata: { displayName: 'Test', version: '0.0.1', packageId: 'test' },
};

describe('ProcessManager', () => {
  it('spawn returns a process with a unique pid', () => {
    const pm = makeManager();
    const p1 = pm.spawn(baseOptions);
    const p2 = pm.spawn(baseOptions);
    expect(p1.pid).toBe(1);
    expect(p2.pid).toBe(2);
    expect(p1.pid).not.toBe(p2.pid);
  });

  it('spawn sets status to running', () => {
    const pm = makeManager();
    const p = pm.spawn(baseOptions);
    expect(p.status).toBe('running');
  });

  it('list contains spawned processes', () => {
    const pm = makeManager();
    pm.spawn(baseOptions);
    pm.spawn(baseOptions);
    expect(pm.list()).toHaveLength(2);
  });

  it('kill removes process from list', () => {
    const pm = makeManager();
    const p = pm.spawn(baseOptions);
    pm.kill(p.pid);
    expect(pm.list()).toHaveLength(0);
    expect(pm.get(p.pid)).toBeUndefined();
  });

  it('kill throws for system process', () => {
    const pm = makeManager();
    const p = pm.spawn({ ...baseOptions, kind: 'system' });
    expect(() => pm.kill(p.pid)).toThrow();
  });

  it('kill throws for unknown pid', () => {
    const pm = makeManager();
    expect(() => pm.kill(999)).toThrow();
  });

  it('suspend sets status to suspended', () => {
    const pm = makeManager();
    const p = pm.spawn(baseOptions);
    pm.suspend(p.pid);
    expect(pm.get(p.pid)!.status).toBe('suspended');
  });

  it('suspend is no-op when already suspended', () => {
    const pm = makeManager();
    const p = pm.spawn(baseOptions);
    pm.suspend(p.pid);
    const listener = vi.fn();
    pm.subscribe(listener);
    pm.suspend(p.pid);
    expect(listener).not.toHaveBeenCalled();
  });

  it('resume sets status back to running', () => {
    const pm = makeManager();
    const p = pm.spawn(baseOptions);
    pm.suspend(p.pid);
    pm.resume(p.pid);
    expect(pm.get(p.pid)!.status).toBe('running');
  });

  it('subscribe listener is called on spawn', () => {
    const pm = makeManager();
    const listener = vi.fn();
    pm.subscribe(listener);
    pm.spawn(baseOptions);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ type: 'spawn' }));
  });

  it('subscribe returns unsubscribe; listener not called after', () => {
    const pm = makeManager();
    const listener = vi.fn();
    const unsub = pm.subscribe(listener);
    unsub();
    pm.spawn(baseOptions);
    expect(listener).not.toHaveBeenCalled();
  });

  it('spawn stores parentPid', () => {
    const pm = makeManager();
    const parent = pm.spawn(baseOptions);
    const child = pm.spawn({ ...baseOptions, parentPid: parent.pid });
    expect(child.parentPid).toBe(parent.pid);
  });

  it('spawned process metadata includes spawnedAt ISO string', () => {
    const pm = makeManager();
    const p = pm.spawn(baseOptions);
    expect(() => new Date(p.metadata.spawnedAt)).not.toThrow();
  });
});
