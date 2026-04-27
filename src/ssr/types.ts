export interface HydrationPayload {
  version: 1;
  router?: { initialPath: string; mode: 'hash' | 'history' };
  vfs?: unknown;
  pdui?: { documents: Record<string, unknown> };
  [key: string]: unknown;
}

export interface SSRContextValue {
  isServer: boolean;
  payload: HydrationPayload;
  mergePayload(slice: Partial<HydrationPayload>): void;
}
