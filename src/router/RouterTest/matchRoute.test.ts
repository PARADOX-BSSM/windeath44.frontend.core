import { describe, it, expect } from 'vitest';
import { matchRoute } from '../matchRoute';
import type { RouteDefinition } from '../types';

const routes: RouteDefinition[] = [
  { path: '/home', processName: 'home' },
  { path: '/explorer/:path*', processName: 'explorer' },
  { path: '/app/:id', processName: 'app' },
];

describe('matchRoute', () => {
  it('matches static path', () => {
    const m = matchRoute('/home', routes);
    expect(m?.route.processName).toBe('home');
    expect(m?.params).toEqual({});
  });

  it('extracts :param segment', () => {
    const m = matchRoute('/app/42', routes);
    expect(m?.route.processName).toBe('app');
    expect(m?.params.id).toBe('42');
  });

  it('extracts :param* greedy segment', () => {
    const m = matchRoute('/explorer/home/user/docs', routes);
    expect(m?.route.processName).toBe('explorer');
    expect(m?.params.path).toBe('home/user/docs');
  });

  it('returns null for no match', () => {
    expect(matchRoute('/unknown', routes)).toBeNull();
  });

  it('first matching route wins', () => {
    const overlapping: RouteDefinition[] = [
      { path: '/a/:id', processName: 'first' },
      { path: '/a/:id', processName: 'second' },
    ];
    const m = matchRoute('/a/1', overlapping);
    expect(m?.route.processName).toBe('first');
  });

  it('merges route.params with dynamic params', () => {
    const r: RouteDefinition[] = [
      { path: '/x/:id', processName: 'x', params: { extra: 'yes' } },
    ];
    const m = matchRoute('/x/7', r);
    expect(m?.params).toEqual({ extra: 'yes', id: '7' });
  });
});
