import type { HydrationPayload } from './types';

const WINDOW_KEY = '__WINDEATH44_STATE__';

export function serializeState(payload: HydrationPayload): string {
  return JSON.stringify(payload).replace(/<\/script>/gi, '<\\/script>');
}

export function injectStateScript(payload: HydrationPayload): string {
  return `<script>window.${WINDOW_KEY}=${serializeState(payload)};</script>`;
}

export function readStateFromWindow(): HydrationPayload | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  return (w[WINDOW_KEY] as HydrationPayload) ?? null;
}
