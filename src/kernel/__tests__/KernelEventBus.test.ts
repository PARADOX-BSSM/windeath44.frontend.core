import { describe, it, expect, vi } from 'vitest';
import { KernelEventBus } from '../ipc/KernelEventBus';

interface TestMap {
  'ping': { n: number };
}

describe('KernelEventBus', () => {
  it('subscribeAs delivers events normally', () => {
    const bus = new KernelEventBus<TestMap>();
    const handler = vi.fn();
    bus.subscribeAs(10, 'ping', handler);
    bus.publish('ping', 10, { n: 1 });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('purge removes all subscriptions for a pid', () => {
    const bus = new KernelEventBus<TestMap>();
    const handler = vi.fn();
    bus.subscribeAs(10, 'ping', handler);
    bus.purge(10);
    bus.publish('ping', 10, { n: 1 });
    expect(handler).not.toHaveBeenCalled();
  });

  it('purge does not affect subscriptions of other pids', () => {
    const bus = new KernelEventBus<TestMap>();
    const h1 = vi.fn();
    const h2 = vi.fn();
    bus.subscribeAs(10, 'ping', h1);
    bus.subscribeAs(20, 'ping', h2);
    bus.purge(10);
    bus.publish('ping', 99, { n: 1 });
    expect(h1).not.toHaveBeenCalled();
    expect(h2).toHaveBeenCalledOnce();
  });

  it('purge on unknown pid is a no-op', () => {
    const bus = new KernelEventBus<TestMap>();
    expect(() => bus.purge(999)).not.toThrow();
  });
});
