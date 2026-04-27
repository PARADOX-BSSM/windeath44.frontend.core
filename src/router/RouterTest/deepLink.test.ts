import { describe, it, expect } from 'vitest';
import { encodeDeepLink, decodeDeepLink } from '../deepLink';
import type { DeepLink } from '../types';

describe('deepLink', () => {
  it('encodes a deep link', () => {
    const link: DeepLink = { processName: 'terminal', path: '/logs', query: { filter: 'error' } };
    expect(encodeDeepLink(link)).toBe('windeath44://terminal/logs?filter=error');
  });

  it('encodes with no query', () => {
    const link: DeepLink = { processName: 'files', path: '/home/user', query: {} };
    expect(encodeDeepLink(link)).toBe('windeath44://files/home/user');
  });

  it('decodes a deep link round-trip', () => {
    const link: DeepLink = { processName: 'terminal', path: '/logs', query: { filter: 'error' } };
    const decoded = decodeDeepLink(encodeDeepLink(link));
    expect(decoded).toEqual(link);
  });

  it('returns null for wrong protocol', () => {
    expect(decodeDeepLink('https://example.com/path')).toBeNull();
  });

  it('decodes process name with no path', () => {
    const decoded = decodeDeepLink('windeath44://launcher');
    expect(decoded?.processName).toBe('launcher');
    expect(decoded?.path).toBe('/');
  });

  it('decodes multiple query params', () => {
    const decoded = decodeDeepLink('windeath44://app/view?a=1&b=2');
    expect(decoded?.query).toEqual({ a: '1', b: '2' });
  });
});
