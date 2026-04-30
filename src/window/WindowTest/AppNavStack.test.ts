import { describe, it, expect } from 'vitest';
import { AppNavStack } from '../AppNavStack';

describe('AppNavStack', () => {
  it('starts empty with null current', () => {
    const stack = new AppNavStack();
    expect(stack.current).toBeNull();
    expect(stack.canBack).toBe(false);
    expect(stack.canForward).toBe(false);
    expect(stack.entries).toEqual([]);
  });

  it('push updates current', () => {
    const stack = new AppNavStack();
    stack.push({ path: '/home' });
    expect(stack.current?.path).toBe('/home');
    expect(stack.canBack).toBe(false);
  });

  it('push multiple entries allows back', () => {
    const stack = new AppNavStack();
    stack.push({ path: '/a' });
    stack.push({ path: '/b' });
    stack.push({ path: '/c' });
    expect(stack.current?.path).toBe('/c');
    expect(stack.canBack).toBe(true);
    expect(stack.canForward).toBe(false);
  });

  it('back moves pointer backward', () => {
    const stack = new AppNavStack();
    stack.push({ path: '/a' });
    stack.push({ path: '/b' });
    stack.push({ path: '/c' });
    const result = stack.back();
    expect(result?.path).toBe('/b');
    expect(stack.current?.path).toBe('/b');
  });

  it('forward moves pointer forward', () => {
    const stack = new AppNavStack();
    stack.push({ path: '/a' });
    stack.push({ path: '/b' });
    stack.push({ path: '/c' });
    stack.back();
    const result = stack.forward();
    expect(result?.path).toBe('/c');
    expect(stack.current?.path).toBe('/c');
  });

  it('back returns null at bottom', () => {
    const stack = new AppNavStack();
    stack.push({ path: '/a' });
    expect(stack.back()).toBeNull();
  });

  it('forward returns null at top', () => {
    const stack = new AppNavStack();
    stack.push({ path: '/a' });
    expect(stack.forward()).toBeNull();
  });

  it('push after back truncates forward history', () => {
    const stack = new AppNavStack();
    stack.push({ path: '/a' });
    stack.push({ path: '/b' });
    stack.push({ path: '/c' });
    stack.back();
    stack.back();
    expect(stack.current?.path).toBe('/a');
    stack.push({ path: '/d' });
    expect(stack.current?.path).toBe('/d');
    expect(stack.canForward).toBe(false);
    expect(stack.entries).toEqual([
      { path: '/a' },
      { path: '/d' },
    ]);
  });

  it('replace overwrites current entry', () => {
    const stack = new AppNavStack();
    stack.push({ path: '/a' });
    stack.push({ path: '/b' });
    stack.replace({ path: '/b-replaced' });
    expect(stack.current?.path).toBe('/b-replaced');
    expect(stack.entries).toEqual([
      { path: '/a' },
      { path: '/b-replaced' },
    ]);
  });

  it('replace on empty stack acts as push', () => {
    const stack = new AppNavStack();
    stack.replace({ path: '/first' });
    expect(stack.current?.path).toBe('/first');
  });

  it('entries returns only up to pointer', () => {
    const stack = new AppNavStack();
    stack.push({ path: '/a' });
    stack.push({ path: '/b' });
    stack.push({ path: '/c' });
    stack.back();
    expect(stack.entries).toEqual([
      { path: '/a' },
      { path: '/b' },
    ]);
  });

  it('preserves state in entries', () => {
    const stack = new AppNavStack();
    stack.push({ path: '/a', state: { scroll: 100 } });
    expect(stack.current?.state).toEqual({ scroll: 100 });
  });
});