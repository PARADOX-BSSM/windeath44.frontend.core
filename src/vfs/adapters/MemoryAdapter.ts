import { VFSError, type FileNode, type FSWatchEvent, type IFileSystemAdapter, type SerializedFS } from '../types';
import { dirname, basename, join, normalize } from '../path';

interface InternalNode {
  type: 'file' | 'directory';
  content: string;
  metadata: { createdAt: number; modifiedAt: number; size: number; mimeType?: string };
}

interface WatchEntry {
  path: string;
  recursive: boolean;
  cb: (e: FSWatchEvent) => void;
}

export class MemoryAdapter implements IFileSystemAdapter {
  private nodes = new Map<string, InternalNode>();
  private watchers: WatchEntry[] = [];

  constructor() {
    this.nodes.set('/', { type: 'directory', content: '', metadata: { createdAt: Date.now(), modifiedAt: Date.now(), size: 0 } });
  }

  private emit(event: FSWatchEvent) {
    for (const w of this.watchers) {
      const matches = event.path === w.path ||
        (w.recursive && event.path.startsWith(w.path === '/' ? '/' : w.path + '/'));
      if (matches) w.cb(event);
    }
  }

  private ensureParent(path: string) {
    const parent = dirname(path);
    const node = this.nodes.get(parent);
    if (!node) throw new VFSError('ENOENT', parent, `No such file or directory: ${parent}`);
    if (node.type !== 'directory') throw new VFSError('ENOTDIR', parent, `Not a directory: ${parent}`);
  }

  async readFile(path: string): Promise<string> {
    const norm = normalize(path);
    const node = this.nodes.get(norm);
    if (!node) throw new VFSError('ENOENT', norm, `No such file: ${norm}`);
    if (node.type === 'directory') throw new VFSError('EISDIR', norm, `Is a directory: ${norm}`);
    return node.content;
  }

  private async mkdirp(path: string): Promise<void> {
    if (this.nodes.has(path)) return;
    await this.mkdirp(dirname(path));
    if (!this.nodes.has(path)) {
      this.nodes.set(path, { type: 'directory', content: '', metadata: { createdAt: Date.now(), modifiedAt: Date.now(), size: 0 } });
      this.emit({ type: 'created', path });
    }
  }

  async writeFile(path: string, content: string, mkdirp = false): Promise<void> {
    const norm = normalize(path);
    if (mkdirp) await this.mkdirp(dirname(norm));
    this.ensureParent(norm);
    const existing = this.nodes.get(norm);
    if (existing?.type === 'directory') throw new VFSError('EISDIR', norm, `Is a directory: ${norm}`);
    const isNew = !existing;
    this.nodes.set(norm, {
      type: 'file',
      content,
      metadata: { createdAt: existing?.metadata.createdAt ?? Date.now(), modifiedAt: Date.now(), size: content.length },
    });
    this.emit({ type: isNew ? 'created' : 'modified', path: norm });
  }

  async unlink(path: string): Promise<void> {
    const norm = normalize(path);
    const node = this.nodes.get(norm);
    if (!node) throw new VFSError('ENOENT', norm, `No such file: ${norm}`);
    if (node.type === 'directory') throw new VFSError('EISDIR', norm, `Is a directory: ${norm}`);
    this.nodes.delete(norm);
    this.emit({ type: 'deleted', path: norm });
  }

  async rmdir(path: string, recursive = false): Promise<void> {
    const norm = normalize(path);
    const node = this.nodes.get(norm);
    if (!node) throw new VFSError('ENOENT', norm, `No such directory: ${norm}`);
    if (node.type !== 'directory') throw new VFSError('ENOTDIR', norm, `Not a directory: ${norm}`);
    const children = [...this.nodes.keys()].filter((k) => k !== norm && k.startsWith(norm === '/' ? '/' : norm + '/'));
    if (children.length && !recursive) throw new VFSError('ENOTEMPTY', norm, `Directory not empty: ${norm}`);
    if (recursive) children.forEach((k) => this.nodes.delete(k));
    this.nodes.delete(norm);
    this.emit({ type: 'deleted', path: norm });
  }

  async mkdir(path: string, exist_ok = false): Promise<void> {
    const norm = normalize(path);
    if (this.nodes.has(norm)) {
      if (exist_ok) return;
      throw new VFSError('EEXIST', norm, `Already exists: ${norm}`);
    }
    this.ensureParent(norm);
    this.nodes.set(norm, { type: 'directory', content: '', metadata: { createdAt: Date.now(), modifiedAt: Date.now(), size: 0 } });
    this.emit({ type: 'created', path: norm });
  }

  async readdir(path: string): Promise<FileNode[]> {
    const norm = normalize(path);
    const node = this.nodes.get(norm);
    if (!node) throw new VFSError('ENOENT', norm, `No such directory: ${norm}`);
    if (node.type !== 'directory') throw new VFSError('ENOTDIR', norm, `Not a directory: ${norm}`);
    const prefix = norm === '/' ? '/' : norm + '/';
    const results: FileNode[] = [];
    for (const [k, v] of this.nodes) {
      if (k === norm) continue;
      if (!k.startsWith(prefix)) continue;
      const rest = k.slice(prefix.length);
      if (rest.includes('/')) continue;
      results.push({ type: v.type, name: basename(k), path: k, metadata: { ...v.metadata } });
    }
    return results;
  }

  async stat(path: string): Promise<FileNode> {
    const norm = normalize(path);
    const node = this.nodes.get(norm);
    if (!node) throw new VFSError('ENOENT', norm, `No such file or directory: ${norm}`);
    return { type: node.type, name: basename(norm) || '/', path: norm, metadata: { ...node.metadata } };
  }

  async exists(path: string): Promise<boolean> {
    return this.nodes.has(normalize(path));
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    const src = normalize(oldPath);
    const dst = normalize(newPath);
    const node = this.nodes.get(src);
    if (!node) throw new VFSError('ENOENT', src, `No such file: ${src}`);
    this.ensureParent(dst);
    this.nodes.delete(src);
    this.nodes.set(dst, { ...node, metadata: { ...node.metadata, modifiedAt: Date.now() } });
    if (node.type === 'directory') {
      const prefix = src === '/' ? '/' : src + '/';
      for (const [k, v] of [...this.nodes]) {
        if (k.startsWith(prefix)) {
          this.nodes.delete(k);
          this.nodes.set(join(dst, k.slice(prefix.length)), v);
        }
      }
    }
    this.emit({ type: 'renamed', path: src, newPath: dst });
  }

  async copy(src: string, dest: string): Promise<void> {
    const content = await this.readFile(src);
    await this.writeFile(dest, content);
  }

  watch(path: string, cb: (e: FSWatchEvent) => void, recursive = false): () => void {
    const entry: WatchEntry = { path: normalize(path), recursive, cb };
    this.watchers.push(entry);
    return () => { this.watchers = this.watchers.filter((w) => w !== entry); };
  }

  serialize(): SerializedFS {
    return {
      version: 1,
      nodes: [...this.nodes.entries()].map(([p, n]) => ({
        path: p,
        type: n.type,
        content: n.type === 'file' ? n.content : undefined,
        metadata: { ...n.metadata },
      })),
    };
  }

  hydrate(data: SerializedFS): void {
    this.nodes.clear();
    for (const n of data.nodes) {
      this.nodes.set(n.path, { type: n.type, content: n.content ?? '', metadata: { ...n.metadata } });
    }
  }
}
