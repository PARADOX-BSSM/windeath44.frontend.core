export const isBrowser = (): boolean =>
  typeof window !== 'undefined' && typeof document !== 'undefined';

export const isServer = (): boolean => !isBrowser();

export function canUseDOM<T>(accessor: () => T): T | undefined {
  if (!isBrowser()) return undefined;
  try { return accessor(); } catch { return undefined; }
}
