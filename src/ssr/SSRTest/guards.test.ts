import { describe, it, expect } from 'vitest';
import { isBrowser, isServer, canUseDOM } from '../guards';

describe('SSR guards', () => {
  it('isBrowser returns true in jsdom', () => {
    expect(isBrowser()).toBe(true);
  });

  it('isServer returns false in jsdom', () => {
    expect(isServer()).toBe(false);
  });

  it('canUseDOM returns accessor result in browser', () => {
    expect(canUseDOM(() => 'ok')).toBe('ok');
  });

  it('canUseDOM returns undefined when accessor throws', () => {
    expect(canUseDOM(() => { throw new Error('boom'); })).toBeUndefined();
  });
});
