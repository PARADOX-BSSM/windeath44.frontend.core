export type FileNodeType = 'file' | 'directory';

export interface FileMetadata {
  createdAt: number;
  modifiedAt: number;
  size: number;
  mimeType?: string;
  tags?: Record<string, string>;
}

export interface FileNode {
  type: FileNodeType;
  name: string;
  path: string;
  metadata: FileMetadata;
}

export type VFSErrorCode = 'ENOENT' | 'EEXIST' | 'ENOTDIR' | 'EISDIR' | 'ENOTEMPTY' | 'EPERM';

export class VFSError extends Error {
  constructor(
    public readonly code: VFSErrorCode,
    public readonly path: string,
    message: string,
  ) {
    super(message);
    this.name = 'VFSError';
  }
}

export interface FSWatchEvent {
  type: 'created' | 'modified' | 'deleted' | 'renamed';
  path: string;
  newPath?: string;
}

export interface SerializedFS {
  version: 1;
  nodes: Array<{
    path: string;
    type: 'file' | 'directory';
    content?: string;
    metadata: FileMetadata;
  }>;
}

export interface IFileSystemAdapter {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string, mkdirp?: boolean): Promise<void>;
  unlink(path: string): Promise<void>;
  rmdir(path: string, recursive?: boolean): Promise<void>;
  mkdir(path: string, exist_ok?: boolean): Promise<void>;
  readdir(path: string): Promise<FileNode[]>;
  stat(path: string): Promise<FileNode>;
  exists(path: string): Promise<boolean>;
  rename(oldPath: string, newPath: string): Promise<void>;
  copy(src: string, dest: string): Promise<void>;
  watch(path: string, cb: (event: FSWatchEvent) => void, recursive?: boolean): () => void;
  serialize(): SerializedFS;
  hydrate(data: SerializedFS): void;
}
