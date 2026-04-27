import type { HistoryAdapter } from '../types';

export class HashHistoryAdapter implements HistoryAdapter {
  private readonly initialPath: string;

  constructor(initialPath = '/') {
    this.initialPath = initialPath;
  }

  getLocation(): string {
    if (typeof window === 'undefined') return this.initialPath;
    return window.location.hash.slice(1) || this.initialPath;
  }

  push(path: string, _state?: unknown): void {
    if (typeof window === 'undefined') return;
    window.location.hash = path;
  }

  replace(path: string, _state?: unknown): void {
    if (typeof window === 'undefined') return;
    const url = window.location.href.split('#')[0] + '#' + path;
    window.location.replace(url);
  }

  back(): void {
    if (typeof window === 'undefined') return;
    window.history.back();
  }

  forward(): void {
    if (typeof window === 'undefined') return;
    window.history.forward();
  }

  listen(cb: (location: string) => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handler = () => cb(this.getLocation());
    window.addEventListener('popstate', handler);
    window.addEventListener('hashchange', handler);
    return () => {
      window.removeEventListener('popstate', handler);
      window.removeEventListener('hashchange', handler);
    };
  }
}
