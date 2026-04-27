import { describe, it, expect } from 'vitest';
import { serializeState, injectStateScript } from '../serialize';
import type { HydrationPayload } from '../types';

const payload: HydrationPayload = { version: 1, router: { initialPath: '/', mode: 'hash' } };

describe('serialize', () => {
  it('serializeState produces valid JSON', () => {
    const s = serializeState(payload);
    expect(() => JSON.parse(s)).not.toThrow();
    expect(JSON.parse(s)).toMatchObject(payload);
  });

  it('serializeState escapes </script> tags', () => {
    const dangerous: HydrationPayload = { version: 1, xss: '</script><script>alert(1)</script>' };
    const s = serializeState(dangerous);
    expect(s).not.toContain('</script>');
  });

  it('injectStateScript produces valid HTML script tag', () => {
    const html = injectStateScript(payload);
    expect(html).toMatch(/^<script>/);
    expect(html).toMatch(/<\/script>$/);
    expect(html).toContain('window.__WINDEATH44_STATE__=');
  });
});
