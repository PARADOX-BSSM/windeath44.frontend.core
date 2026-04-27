import { describe, it, expect, vi } from 'vitest';
import { MemoryAdapter } from '../adapters/MemoryAdapter';
import { VFSError } from '../types';

async function make() { return new MemoryAdapter(); }

describe('MemoryAdapter', () => {
  it('writeFile/readFile round-trip', async () => {
    const fs = await make();
    await fs.writeFile('/hello.txt', 'world');
    expect(await fs.readFile('/hello.txt')).toBe('world');
  });

  it('readFile throws ENOENT', async () => {
    const fs = await make();
    await expect(fs.readFile('/missing')).rejects.toThrow(VFSError);
  });

  it('readFile on directory throws EISDIR', async () => {
    const fs = await make();
    await fs.mkdir('/dir');
    const err = await fs.readFile('/dir').catch((e) => e);
    expect(err.code).toBe('EISDIR');
  });

  it('mkdir creates directory', async () => {
    const fs = await make();
    await fs.mkdir('/foo');
    expect(await fs.exists('/foo')).toBe(true);
  });

  it('mkdir with exist_ok does not throw', async () => {
    const fs = await make();
    await fs.mkdir('/foo');
    await expect(fs.mkdir('/foo', true)).resolves.toBeUndefined();
  });

  it('mkdir without exist_ok throws EEXIST', async () => {
    const fs = await make();
    await fs.mkdir('/foo');
    const err = await fs.mkdir('/foo').catch((e) => e);
    expect(err.code).toBe('EEXIST');
  });

  it('readdir lists direct children only', async () => {
    const fs = await make();
    await fs.mkdir('/a');
    await fs.mkdir('/a/b');
    await fs.writeFile('/a/file.txt', 'x');
    await fs.writeFile('/a/b/deep.txt', 'y');
    const entries = await fs.readdir('/a');
    const names = entries.map((e) => e.name).sort();
    expect(names).toEqual(['b', 'file.txt']);
  });

  it('unlink removes file', async () => {
    const fs = await make();
    await fs.writeFile('/f.txt', 'data');
    await fs.unlink('/f.txt');
    expect(await fs.exists('/f.txt')).toBe(false);
  });

  it('unlink on directory throws EISDIR', async () => {
    const fs = await make();
    await fs.mkdir('/d');
    const err = await fs.unlink('/d').catch((e) => e);
    expect(err.code).toBe('EISDIR');
  });

  it('rmdir throws ENOTEMPTY without recursive', async () => {
    const fs = await make();
    await fs.mkdir('/d');
    await fs.writeFile('/d/f.txt', '');
    const err = await fs.rmdir('/d').catch((e) => e);
    expect(err.code).toBe('ENOTEMPTY');
  });

  it('rmdir recursive removes all children', async () => {
    const fs = await make();
    await fs.mkdir('/d');
    await fs.writeFile('/d/f.txt', '');
    await fs.rmdir('/d', true);
    expect(await fs.exists('/d')).toBe(false);
  });

  it('stat returns metadata', async () => {
    const fs = await make();
    await fs.writeFile('/a.txt', 'hello');
    const node = await fs.stat('/a.txt');
    expect(node.type).toBe('file');
    expect(node.name).toBe('a.txt');
    expect(node.metadata.size).toBe(5);
  });

  it('rename moves file', async () => {
    const fs = await make();
    await fs.writeFile('/old.txt', 'data');
    await fs.rename('/old.txt', '/new.txt');
    expect(await fs.exists('/old.txt')).toBe(false);
    expect(await fs.readFile('/new.txt')).toBe('data');
  });

  it('watch fires on write', async () => {
    const fs = await make();
    const cb = vi.fn();
    fs.watch('/', cb, true);
    await fs.writeFile('/a.txt', 'hi');
    expect(cb).toHaveBeenCalledOnce();
    expect(cb.mock.calls[0][0].type).toBe('created');
  });

  it('watch unsubscribe stops events', async () => {
    const fs = await make();
    const cb = vi.fn();
    const unsub = fs.watch('/', cb, true);
    unsub();
    await fs.writeFile('/a.txt', 'hi');
    expect(cb).not.toHaveBeenCalled();
  });

  it('serialize/hydrate round-trip', async () => {
    const fs = await make();
    await fs.mkdir('/docs');
    await fs.writeFile('/docs/readme.txt', 'hello');
    const snap = fs.serialize();

    const fs2 = new MemoryAdapter();
    fs2.hydrate(snap);
    expect(await fs2.readFile('/docs/readme.txt')).toBe('hello');
  });

  it('writeFile with mkdirp creates parent dirs', async () => {
    const fs = await make();
    await fs.writeFile('/a/b/c.txt', 'deep', true);
    expect(await fs.readFile('/a/b/c.txt')).toBe('deep');
  });
});
