import type { AppManifest } from '../app-registry/types';
import { AppRegistry } from '../app-registry/AppRegistry';
import { matchRoute, type RouteDefinition } from '../router/matchRoute';

export interface SSRAppResolverOptions {
  registry: AppRegistry;
  url: string;
}

export interface SSRAppResolveResult {
  manifest: AppManifest | null;
  params: Record<string, string>;
}

export function resolveSSRApp(options: SSRAppResolverOptions): SSRAppResolveResult {
  const { registry, url } = options;
  const path = url.split('?')[0];

  const manifests = registry.list();
  const routes: RouteDefinition[] = manifests
    .filter((m) => m.route)
    .map((m) => ({ path: m.route!, processName: m.entryProcess }));

  const match = matchRoute(path, routes);

  if (!match) {
    return { manifest: null, params: {} };
  }

  const matched = manifests.find((m) => m.route === match.route.path) ?? null;
  return { manifest: matched, params: match.params };
}
