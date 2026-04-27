export interface RouteDefinition {
  path: string;
  processName: string;
  params?: Record<string, string>;
}

export interface RouteMatch {
  route: RouteDefinition;
  params: Record<string, string>;
  rest: string;
}

export interface DeepLink {
  processName: string;
  path: string;
  query: Record<string, string>;
}

export interface RouterContextValue {
  location: string;
  match: RouteMatch | null;
  navigate(path: string, options?: { replace?: boolean; state?: unknown }): void;
  navigateDeepLink(link: string): void;
  back(): void;
  forward(): void;
}

export interface HistoryAdapter {
  getLocation(): string;
  push(path: string, state?: unknown): void;
  replace(path: string, state?: unknown): void;
  back(): void;
  forward(): void;
  listen(cb: (location: string) => void): () => void;
}

export type RouterMode = 'hash' | 'history';
