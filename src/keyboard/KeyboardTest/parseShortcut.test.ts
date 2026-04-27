import { describe, it, expect } from 'vitest';
import { parseShortcut } from '../parseShortcut';

describe('parseShortcut', () => {
  it('parses Ctrl+K', () => {
    expect(parseShortcut('Ctrl+K')).toEqual({ key: 'k', ctrl: true, shift: false, alt: false, meta: false });
  });

  it('parses Ctrl+Shift+S', () => {
    expect(parseShortcut('Ctrl+Shift+S')).toEqual({ key: 's', ctrl: true, shift: true, alt: false, meta: false });
  });

  it('is case-insensitive', () => {
    expect(parseShortcut('ctrl+shift+k')).toEqual(parseShortcut('Ctrl+Shift+K'));
  });

  it('parses Alt+F4', () => {
    expect(parseShortcut('Alt+F4')).toEqual({ key: 'f4', ctrl: false, shift: false, alt: true, meta: false });
  });

  it('parses Meta/Cmd alias', () => {
    expect(parseShortcut('Cmd+Z')).toEqual({ key: 'z', ctrl: false, shift: false, alt: false, meta: true });
    expect(parseShortcut('Meta+Z')).toEqual(parseShortcut('Cmd+Z'));
  });

  it('handles single key', () => {
    expect(parseShortcut('Escape')).toEqual({ key: 'escape', ctrl: false, shift: false, alt: false, meta: false });
  });
});
