import { MemoryAdapter } from './MemoryAdapter';
import type { FSWatchEvent, FileNode, IFileSystemAdapter, SerializedFS } from '../types';

const STORAGE_KEY = '__wd_vfs__';

export class LocalStorageAdapter implements IFileSystemAdapter {
  private readonly inner: MemoryAdapter;

  static isSupported(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  constructor() {
    this.inner = new MemoryAdapter();
    if (LocalStorageAdapter.isSupported()) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) this.inner.hydrate(JSON.parse(raw) as SerializedFS);
      } catch {
        // corrupt data — start fresh
      }
    }
  }

  private persist(): void {
    if (!LocalStorageAdapter.isSupported()) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.inner.serialize()));
  }

  async readFile(path: string): Promise<string> { return this.inner.readFile(path); }

  async writeFile(path: string, content: string, mkdirp?: boolean): Promise<void> {
    await this.inner.writeFile(path, content, mkdirp);
    this.persist();
  }

  async unlink(path: string): Promise<void> { await this.inner.unlink(path); this.persist(); }
  async rmdir(path: string, recursive?: boolean): Promise<void> { await this.inner.rmdir(path, recursive); this.persist(); }
  async mkdir(path: string, exist_ok?: boolean): Promise<void> { await this.inner.mkdir(path, exist_ok); this.persist(); }
  async readdir(path: string): Promise<FileNode[]> { return this.inner.readdir(path); }
  async stat(path: string) { return this.inner.stat(path); }
  async exists(path: string): Promise<boolean> { return this.inner.exists(path); }
  async rename(o: string, n: string): Promise<void> { await this.inner.rename(o, n); this.persist(); }
  async copy(s: string, d: string): Promise<void> { await this.inner.copy(s, d); this.persist(); }
  watch(path: string, cb: (e: FSWatchEvent) => void, recursive?: boolean) { return this.inner.watch(path, cb, recursive); }
  serialize(): SerializedFS { return this.inner.serialize(); }
  hydrate(data: SerializedFS): void { this.inner.hydrate(data); this.persist(); }
}
