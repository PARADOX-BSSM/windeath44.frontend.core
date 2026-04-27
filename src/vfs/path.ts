export function normalize(p: string): string {
  const abs = p.startsWith('/');
  const parts = p.split('/').reduce<string[]>((acc, seg) => {
    if (seg === '' || seg === '.') return acc;
    if (seg === '..') { acc.pop(); return acc; }
    acc.push(seg);
    return acc;
  }, []);
  return (abs ? '/' : '') + parts.join('/') || '/';
}

export function join(...parts: string[]): string {
  return normalize(parts.join('/'));
}

export function dirname(p: string): string {
  const norm = normalize(p);
  const idx = norm.lastIndexOf('/');
  if (idx <= 0) return '/';
  return norm.slice(0, idx);
}

export function basename(p: string, ext?: string): string {
  const norm = normalize(p);
  const base = norm.slice(norm.lastIndexOf('/') + 1) || '/';
  if (ext && base.endsWith(ext)) return base.slice(0, -ext.length);
  return base;
}

export function extname(p: string): string {
  const base = basename(p);
  const dot = base.lastIndexOf('.');
  return dot > 0 ? base.slice(dot) : '';
}

export function isAbsolute(p: string): boolean {
  return p.startsWith('/');
}

export function resolve(base: string, ...paths: string[]): string {
  let cur = base;
  for (const p of paths) {
    cur = isAbsolute(p) ? p : join(cur, p);
  }
  return normalize(cur);
}
