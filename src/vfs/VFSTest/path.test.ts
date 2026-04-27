import { describe, it, expect } from 'vitest';
import { join, dirname, basename, extname, normalize, isAbsolute, resolve } from '../path';

describe('vfsPath', () => {
  describe('normalize', () => {
    it('collapses double slashes', () => expect(normalize('//a//b')).toBe('/a/b'));
    it('resolves ./', () => expect(normalize('/a/./b')).toBe('/a/b'));
    it('resolves ../', () => expect(normalize('/a/b/../c')).toBe('/a/c'));
    it('returns / for empty', () => expect(normalize('')).toBe('/'));
  });

  describe('join', () => {
    it('joins segments', () => expect(join('/a', 'b', 'c')).toBe('/a/b/c'));
    it('handles trailing slash', () => expect(join('/a/', 'b')).toBe('/a/b'));
  });

  describe('dirname', () => {
    it('returns parent', () => expect(dirname('/a/b/c')).toBe('/a/b'));
    it('returns / for top-level', () => expect(dirname('/a')).toBe('/'));
    it('returns / for root', () => expect(dirname('/')).toBe('/'));
  });

  describe('basename', () => {
    it('returns last segment', () => expect(basename('/a/b/c.txt')).toBe('c.txt'));
    it('strips extension if provided', () => expect(basename('/a/b/c.txt', '.txt')).toBe('c'));
    it('returns / for root', () => expect(basename('/')).toBe('/'));
  });

  describe('extname', () => {
    it('returns extension', () => expect(extname('/a/b.txt')).toBe('.txt'));
    it('returns empty for no extension', () => expect(extname('/a/b')).toBe(''));
  });

  describe('isAbsolute', () => {
    it('true for /path', () => expect(isAbsolute('/a')).toBe(true));
    it('false for relative', () => expect(isAbsolute('a/b')).toBe(false));
  });

  describe('resolve', () => {
    it('resolves relative path against base', () => expect(resolve('/home/user', 'docs')).toBe('/home/user/docs'));
    it('absolute path overrides base', () => expect(resolve('/home', '/etc')).toBe('/etc'));
  });
});
