import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Kernel, getKernel, initKernel, _resetKernel } from '../Kernel';

beforeEach(() => {
  _resetKernel();
});

describe('Kernel', () => {
  it('has an initProcess with pid=1 and kind=system', () => {
    const kernel = new Kernel();
    expect(kernel.initProcess.pid).toBe(1);
    expect(kernel.initProcess.kind).toBe('system');
    expect(kernel.initProcess.name).toBe('init');
  });

  it('boot calls features in order', async () => {
    const kernel = new Kernel();
    const order: number[] = [];
    await kernel.boot({
      features: [
        () => { order.push(1); },
        async () => { order.push(2); },
        () => { order.push(3); },
      ],
    });
    expect(order).toEqual([1, 2, 3]);
  });

  it('boot throws if called twice', async () => {
    const kernel = new Kernel();
    await kernel.boot({ features: [] });
    await expect(kernel.boot({ features: [] })).rejects.toThrow();
  });

  it('boot publishes desktop:ready after features', async () => {
    const kernel = new Kernel();
    const handler = vi.fn();
    kernel.bus.subscribe('desktop:ready', handler);
    await kernel.boot({ features: [] });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('killing a process fires process:killed on the bus', async () => {
    const kernel = new Kernel();
    const handler = vi.fn();
    kernel.bus.subscribe('process:killed', handler);
    const p = kernel.spawn({
      name: 'worker',
      kind: 'app',
      metadata: { displayName: 'Worker', version: '0.0.1', packageId: 'test' },
    });
    kernel.processManager.kill(p.pid);
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ payload: { pid: p.pid } }));
  });

  it('killing a process purges its bus subscriptions', () => {
    const kernel = new Kernel();
    const p = kernel.spawn({
      name: 'worker',
      kind: 'app',
      metadata: { displayName: 'Worker', version: '0.0.1', packageId: 'test' },
    });
    const handler = vi.fn();
    kernel.bus.subscribeAs(p.pid, 'desktop:ready', handler);
    kernel.processManager.kill(p.pid);
    kernel.bus.publish('desktop:ready', 0, {});
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('initKernel / getKernel', () => {
  it('initKernel creates and stores a kernel singleton', () => {
    const kernel = initKernel();
    expect(getKernel()).toBe(kernel);
  });

  it('initKernel throws if called twice', () => {
    initKernel();
    expect(() => initKernel()).toThrow();
  });

  it('getKernel throws before initKernel', () => {
    expect(() => getKernel()).toThrow();
  });
});
