import { describe, it, expect } from 'vitest';
import { PduiParser } from '../parser/PduiParser';
import { PduiParseError } from '../parser/errors';

const valid = JSON.stringify({
  version: 1,
  meta: { title: 'Test' },
  root: {
    type: 'Container',
    props: { layout: 'vertical' },
    children: [
      { type: 'Label', props: { text: 'Hello' } },
      { type: 'Button', props: { label: 'Click' } },
    ],
  },
});

describe('PduiParser', () => {
  it('parses valid document', () => {
    const doc = PduiParser.parse(valid);
    expect(doc.version).toBe(1);
    expect(doc.meta.title).toBe('Test');
    expect(doc.root.type).toBe('Container');
  });

  it('assigns _key to root node', () => {
    const doc = PduiParser.parse(valid);
    expect(doc.root._key).toBeDefined();
  });

  it('assigns _key to nested children', () => {
    const doc = PduiParser.parse(valid);
    expect(doc.root.children?.[0]._key).toBeDefined();
    expect(doc.root.children?.[1]._key).toBeDefined();
  });

  it('throws PduiParseError for invalid JSON', () => {
    expect(() => PduiParser.parse('not json')).toThrow(PduiParseError);
  });

  it('throws PduiParseError when version is missing', () => {
    const bad = JSON.stringify({ meta: { title: 'x' }, root: { type: 'Container' } });
    expect(() => PduiParser.parse(bad)).toThrow(PduiParseError);
  });

  it('throws PduiParseError when node type is missing', () => {
    const bad = JSON.stringify({ version: 1, meta: { title: 'x' }, root: { props: {} } });
    expect(() => PduiParser.parse(bad)).toThrow(PduiParseError);
  });

  it('throws PduiParseError when children is not an array', () => {
    const bad = JSON.stringify({ version: 1, meta: { title: 'x' }, root: { type: 'A', children: 'bad' } });
    expect(() => PduiParser.parse(bad)).toThrow(PduiParseError);
  });
});
