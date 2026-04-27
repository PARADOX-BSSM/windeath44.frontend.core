import type { DeepLink } from './types';

const PROTOCOL = 'windeath44://';

export function encodeDeepLink(link: DeepLink): string {
  const query = Object.keys(link.query).length
    ? '?' + new URLSearchParams(link.query).toString()
    : '';
  return `${PROTOCOL}${link.processName}${link.path}${query}`;
}

export function decodeDeepLink(raw: string): DeepLink | null {
  if (!raw.startsWith(PROTOCOL)) return null;
  const without = raw.slice(PROTOCOL.length);
  const [hostPath, queryStr] = without.split('?');
  const slashIdx = hostPath.indexOf('/');
  const processName = slashIdx === -1 ? hostPath : hostPath.slice(0, slashIdx);
  const path = slashIdx === -1 ? '/' : hostPath.slice(slashIdx);
  const query: Record<string, string> = {};
  if (queryStr) {
    new URLSearchParams(queryStr).forEach((v, k) => { query[k] = v; });
  }
  return { processName, path, query };
}
