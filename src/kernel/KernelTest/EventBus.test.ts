import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '../ipc/EventBus';
import type { EventMap } from '../ipc/types';

interface TestMap extends EventMap {
  'test:event': { value: number };
  'other:event': { msg: string };
}

describe('EventBus', () => {
  it('publish calls all subscribers on the channel', () => {
    const bus = new EventBus<TestMap>();
    const handler = vi.fn();
    bus.subscribe('test:event', handler);
    bus.publish('test:event', 1, { value: 42 });
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].payload).toEqual({ value: 42 });
  });

  it('publish does not call subscribers on other channels', () => {
    const bus = new EventBus<TestMap>();
    const handler = vi.fn();
    bus.subscribe('other:event', handler);
    bus.publish('test:event', 1, { value: 1 });
    expect(handler).not.toHaveBeenCalled();
  });

  it('unsubscribe stops delivery', () => {
    const bus = new EventBus<TestMap>();
    const handler = vi.fn();
    const token = bus.subscribe('test:event', handler);
    bus.unsubscribe(token);
    bus.publish('test:event', 1, { value: 1 });
    expect(handler).not.toHaveBeenCalled();
  });

  it('seq increments monotonically', () => {
    const bus = new EventBus<TestMap>();
    const seqs: number[] = [];
    bus.subscribe('test:event', (e) => seqs.push(e.seq));
    bus.publish('test:event', 1, { value: 1 });
    bus.publish('test:event', 1, { value: 2 });
    bus.publish('test:event', 1, { value: 3 });
    expect(seqs).toEqual([1, 2, 3]);
  });

  it('multiple subscribers on same channel all receive event', () => {
    const bus = new EventBus<TestMap>();
    const h1 = vi.fn();
    const h2 = vi.fn();
    bus.subscribe('test:event', h1);
    bus.subscribe('test:event', h2);
    bus.publish('test:event', 1, { value: 99 });
    expect(h1).toHaveBeenCalledOnce();
    expect(h2).toHaveBeenCalledOnce();
  });

  it('subscribing inside a handler does not cause infinite loop', () => {
    const bus = new EventBus<TestMap>();
    let count = 0;
    bus.subscribe('test:event', () => {
      count++;
      if (count === 1) {
        bus.subscribe('test:event', () => { count++; });
      }
    });
    bus.publish('test:event', 1, { value: 1 });
    expect(count).toBe(1);
  });

  it('event includes senderPid and timestamp', () => {
    const bus = new EventBus<TestMap>();
    let received: unknown;
    bus.subscribe('test:event', (e) => { received = e; });
    bus.publish('test:event', 42, { value: 0 });
    expect((received as { senderPid: number }).senderPid).toBe(42);
    expect(typeof (received as { timestamp: string }).timestamp).toBe('string');
  });
});
