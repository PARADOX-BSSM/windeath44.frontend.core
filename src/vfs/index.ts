export { VFSProvider, useFS } from './VFSProvider';
export { MemoryAdapter } from './adapters/MemoryAdapter';
export { LocalStorageAdapter } from './adapters/LocalStorageAdapter';
export * as vfsPath from './path';
export type {
  FileNode,
  FileNodeType,
  FileMetadata,
  FSWatchEvent,
  SerializedFS,
  IFileSystemAdapter,
  VFSErrorCode,
} from './types';
export { VFSError } from './types';
