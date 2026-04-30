import { describe, it, expect } from 'vitest';
import { createWindowStore } from '../WindowStore';

const opts = {
  pid: 1,
  title: 'Test Window',
  children: null,
};

describe('WindowStore navStack', () => {
  it('open creates a navStack for window', () => {
    const store = createWindowStore();
    const id = store.open(opts);
    const navStack = store.getState().navStacks.get(id);
    expect(navStack).toBeDefined();
    expect(navStack!.current).toBeNull();
  });

  it('open sets focusedId', () => {
    const store = createWindowStore();
    const id = store.open(opts);
    expect(store.getState().focusedId).toBe(id);
  });

  it('close removes navStack', () => {
    const store = createWindowStore();
    const id = store.open(opts);
    store.close(id);
    expect(store.getState().navStacks.has(id)).toBe(false);
    expect(store.getState().focusedId).toBeNull();
  });

  it('close unfocused window does not change focusedId', () => {
    const store = createWindowStore();
    const id1 = store.open(opts);
    const id2 = store.open({ ...opts, pid: 2 });
    store.close(id1);
    expect(store.getState().focusedId).toBe(id2);
  });

  it('navigate pushes to navStack', () => {
    const store = createWindowStore();
    const id = store.open(opts);
    store.navigate(id, { path: '/page1' });
    const navStack = store.getState().navStacks.get(id)!;
    expect(navStack.current?.path).toBe('/page1');
  });

  it('navigate calls onNavigate when focused', () => {
    const store = createWindowStore();
    const navigated: string[] = [];
    store.setOnNavigate((path) => navigated.push(path));
    const id = store.open(opts);
    store.navigate(id, { path: '/page1' });
    expect(navigated).toEqual(['/page1']);
  });

  it('navigate does not call onNavigate when not focused', () => {
    const store = createWindowStore();
    const navigated: string[] = [];
    store.setOnNavigate((path) => navigated.push(path));
    const id1 = store.open(opts);
    store.open({ ...opts, pid: 2 });
    store.navigate(id1, { path: '/page1' });
    expect(navigated).toEqual([]);
  });

  it('goBack returns previous path and calls onNavigate', () => {
    const store = createWindowStore();
    const navigated: string[] = [];
    store.setOnNavigate((path) => navigated.push(path));
    const id = store.open(opts);
    store.navigate(id, { path: '/a' });
    store.navigate(id, { path: '/b' });
    store.navigate(id, { path: '/c' });
    const result = store.goBack(id);
    expect(result).toBe('/b');
    expect(navigated).toEqual(['/a', '/b', '/c', '/b']);
  });

  it('goForward returns next path and calls onNavigate', () => {
    const store = createWindowStore();
    const navigated: string[] = [];
    store.setOnNavigate((path) => navigated.push(path));
    const id = store.open(opts);
    store.navigate(id, { path: '/a' });
    store.navigate(id, { path: '/b' });
    store.goBack(id);
    const result = store.goForward(id);
    expect(result).toBe('/b');
  });

  it('goBack returns null at bottom', () => {
    const store = createWindowStore();
    const id = store.open(opts);
    store.navigate(id, { path: '/a' });
    expect(store.goBack(id)).toBeNull();
  });

  it('goForward returns null at top', () => {
    const store = createWindowStore();
    const id = store.open(opts);
    store.navigate(id, { path: '/a' });
    expect(store.goForward(id)).toBeNull();
  });

  it('focus switches focusedId and syncs URL via onNavigate', () => {
    const store = createWindowStore();
    const navigated: string[] = [];
    store.setOnNavigate((path) => navigated.push(path));
    const id1 = store.open(opts);
    store.open({ ...opts, pid: 2 });
    store.navigate(id1, { path: '/app1/page' });
    store.focus(id1);
    expect(navigated).toEqual(['/app1/page']);
    expect(store.getState().focusedId).toBe(id1);
  });

  it('focus with empty navStack does not call onNavigate', () => {
    const store = createWindowStore();
    const navigated: string[] = [];
    store.setOnNavigate((path) => navigated.push(path));
    const id1 = store.open(opts);
    store.open({ ...opts, pid: 2 });
    navigated.length = 0;
    store.focus(id1);
    expect(navigated).toEqual([]);
  });

  it('goBack on non-focused window does not call onNavigate', () => {
    const store = createWindowStore();
    const navigated: string[] = [];
    store.setOnNavigate((path) => navigated.push(path));
    const id1 = store.open(opts);
    store.open({ ...opts, pid: 2 });
    store.navigate(id1, { path: '/a' });
    store.navigate(id1, { path: '/b' });
    navigated.length = 0;
    store.goBack(id1);
    expect(navigated).toEqual([]);
  });
});