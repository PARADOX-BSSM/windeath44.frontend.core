import type { HistoryAdapter } from '../types';

export class BrowserHistoryAdapter implements HistoryAdapter {
  private readonly initialPath: string;

  constructor(initialPath = '/') {
    this.initialPath = initialPath;
  }

  getLocation(): string {
    if (typeof window === 'undefined') return this.initialPath;
    return window.location.pathname;
  }

  push(path: string, state?: unknown): void {
    if (typeof window === 'undefined') return;
    window.history.pushState(state ?? null, '', path);
  }

  replace(path: string, state?: unknown): void {
    if (typeof window === 'undefined') return;
    window.history.replaceState(state ?? null, '', path);
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
    return () => window.removeEventListener('popstate', handler);
  }
}
