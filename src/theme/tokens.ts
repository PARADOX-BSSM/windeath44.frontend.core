import type { ThemeTokens } from './types';

export function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, (c) => `-${c.toLowerCase()}`);
}

export function applyTokensToElement(el: HTMLElement, tokens: ThemeTokens): void {
  for (const [key, value] of Object.entries(tokens)) {
    el.style.setProperty(`--wd-${camelToKebab(key)}`, String(value));
  }
}
