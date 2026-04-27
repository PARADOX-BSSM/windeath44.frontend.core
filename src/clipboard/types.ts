export type ClipboardDataType = 'text' | 'files' | 'image';

export interface ClipboardTextData {
  type: 'text';
  text: string;
  html?: string;
}

export interface ClipboardFilesData {
  type: 'files';
  /** VFS 경로 배열 */
  paths: string[];
}

export interface ClipboardImageData {
  type: 'image';
  dataUrl: string;
  mimeType: string;
}

export type ClipboardData = ClipboardTextData | ClipboardFilesData | ClipboardImageData;

export interface ClipboardContextValue {
  data: ClipboardData | null;
  write(data: ClipboardData): void;
  read(): ClipboardData | null;
  clear(): void;
  writeToSystem(text: string): Promise<void>;
  readFromSystem(): Promise<string | null>;
}
