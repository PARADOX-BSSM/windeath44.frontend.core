import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';

beforeEach(() => localStorage.clear());

describe('LocalStorageAdapter', () => {
  it('isSupported returns true in jsdom', () => {
    expect(LocalStorageAdapter.isSupported()).toBe(true);
  });

  it('persists written file to localStorage', async () => {
    const fs = new LocalStorageAdapter();
    await fs.writeFile('/note.txt', 'saved');
    expect(localStorage.getItem('__wd_vfs__')).toContain('saved');
  });

  it('restores state from localStorage on reconstruction', async () => {
    const fs1 = new LocalStorageAdapter();
    await fs1.writeFile('/note.txt', 'hello');

    const fs2 = new LocalStorageAdapter();
    expect(await fs2.readFile('/note.txt')).toBe('hello');
  });

  it('mkdir persists to localStorage', async () => {
    const fs = new LocalStorageAdapter();
    await fs.mkdir('/mydir');
    const fs2 = new LocalStorageAdapter();
    expect(await fs2.exists('/mydir')).toBe(true);
  });

  it('unlink persists removal', async () => {
    const fs = new LocalStorageAdapter();
    await fs.writeFile('/tmp.txt', 'x');
    await fs.unlink('/tmp.txt');
    const fs2 = new LocalStorageAdapter();
    expect(await fs2.exists('/tmp.txt')).toBe(false);
  });
});
