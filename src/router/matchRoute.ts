import type { RouteDefinition, RouteMatch } from './types';

function routeToRegex(pattern: string): { regex: RegExp; keys: string[] } {
  const keys: string[] = [];
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)\*/g, (_m, key) => {
      keys.push(key);
      return '(.+)';
    })
    .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_m, key) => {
      keys.push(key);
      return '([^/]+)';
    });
  return { regex: new RegExp(`^${escaped}(?:/.*)?$`), keys };
}

export function matchRoute(
  location: string,
  routes: RouteDefinition[],
): RouteMatch | null {
  for (const route of routes) {
    const { regex, keys } = routeToRegex(route.path);
    const m = location.match(regex);
    if (!m) continue;

    const params: Record<string, string> = { ...(route.params ?? {}) };
    keys.forEach((k, i) => { params[k] = m[i + 1] ?? ''; });

    const rest = location.slice(route.path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)\*/g, '').length);
    return { route, params, rest };
  }
  return null;
}
