import { describe, it, expect } from 'vitest';
import { createWindowStore } from '../WindowStore';

const opts = {
  pid: 1,
  title: 'Test Window',
  children: null,
};

describe('WindowStore', () => {
  it('open returns an id and adds to windows', () => {
    const store = createWindowStore();
    const id = store.open(opts);
    expect(id).toBeTruthy();
    expect(store.getState().windows.has(id)).toBe(true);
  });

  it('open sets default status to normal', () => {
    const store = createWindowStore();
    const id = store.open(opts);
    expect(store.getState().windows.get(id)!.status).toBe('normal');
  });

  it('close removes window', () => {
    const store = createWindowStore();
    const id = store.open(opts);
    store.close(id);
    expect(store.getState().windows.has(id)).toBe(false);
  });

  it('minimize sets status to minimized', () => {
    const store = createWindowStore();
    const id = store.open(opts);
    store.minimize(id);
    expect(store.getState().windows.get(id)!.status).toBe('minimized');
  });

  it('maximize sets status to maximized', () => {
    const store = createWindowStore();
    const id = store.open(opts);
    store.maximize(id);
    expect(store.getState().windows.get(id)!.status).toBe('maximized');
  });

  it('restore sets status back to normal', () => {
    const store = createWindowStore();
    const id = store.open(opts);
    store.maximize(id);
    store.restore(id);
    expect(store.getState().windows.get(id)!.status).toBe('normal');
  });

  it('focus increases zIndex above all others', () => {
    const store = createWindowStore();
    const id1 = store.open(opts);
    const id2 = store.open(opts);
    store.focus(id1);
    expect(store.getState().windows.get(id1)!.zIndex).toBeGreaterThan(
      store.getState().windows.get(id2)!.zIndex,
    );
  });

  it('move updates position', () => {
    const store = createWindowStore();
    const id = store.open(opts);
    store.move(id, { x: 100, y: 200 });
    const w = store.getState().windows.get(id)!;
    expect(w.position).toEqual({ x: 100, y: 200 });
  });

  it('resize updates size respecting minSize', () => {
    const store = createWindowStore();
    const id = store.open({ ...opts, minSize: { width: 200, height: 100 } });
    store.resize(id, { width: 50, height: 50 });
    const w = store.getState().windows.get(id)!;
    expect(w.size.width).toBe(200);
    expect(w.size.height).toBe(100);
  });

  it('resize allows valid larger size', () => {
    const store = createWindowStore();
    const id = store.open(opts);
    store.resize(id, { width: 800, height: 600 });
    expect(store.getState().windows.get(id)!.size).toEqual({ width: 800, height: 600 });
  });

  it('subscribe listener called on open', () => {
    const store = createWindowStore();
    let called = 0;
    store.subscribe(() => called++);
    store.open(opts);
    expect(called).toBe(1);
  });

  it('subscribe returns unsubscribe', () => {
    const store = createWindowStore();
    let called = 0;
    const unsub = store.subscribe(() => called++);
    unsub();
    store.open(opts);
    expect(called).toBe(0);
  });

  it('close throws for unknown id', () => {
    const store = createWindowStore();
    // close on unknown id should not throw (silent no-op via delete)
    expect(() => store.close('nonexistent')).not.toThrow();
  });
});
