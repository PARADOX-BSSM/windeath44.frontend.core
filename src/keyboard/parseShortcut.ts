import type { KeyCombo } from './types';

const MODIFIER_ALIASES: Record<string, string> = {
  ctrl: 'ctrl', control: 'ctrl',
  shift: 'shift',
  alt: 'alt', option: 'alt',
  meta: 'meta', cmd: 'meta', command: 'meta', win: 'meta', super: 'meta',
};

export function parseShortcut(shortcut: string): KeyCombo {
  const parts = shortcut.split('+').map((p) => p.trim().toLowerCase());
  let ctrl = false, shift = false, alt = false, meta = false;
  const keys: string[] = [];

  for (const part of parts) {
    const mod = MODIFIER_ALIASES[part];
    if (mod === 'ctrl') { ctrl = true; }
    else if (mod === 'shift') { shift = true; }
    else if (mod === 'alt') { alt = true; }
    else if (mod === 'meta') { meta = true; }
    else { keys.push(part); }
  }

  return { key: keys[0] ?? '', ctrl, shift, alt, meta };
}

export function matchesCombo(event: KeyboardEvent, combo: KeyCombo): boolean {
  return (
    event.key.toLowerCase() === combo.key &&
    event.ctrlKey === combo.ctrl &&
    event.shiftKey === combo.shift &&
    event.altKey === combo.alt &&
    event.metaKey === combo.meta
  );
}
