import type { PduiDocument, PduiNode } from '../schema/types';
import { PduiParseError } from './errors';

function validateNode(node: unknown, path: string): PduiNode {
  if (!node || typeof node !== 'object') {
    throw new PduiParseError(path, node, `Expected node object at ${path}`);
  }
  const n = node as Record<string, unknown>;
  if (typeof n.type !== 'string' || !n.type) {
    throw new PduiParseError(`${path}.type`, n.type, `Missing or invalid "type" at ${path}`);
  }
  if (n.props !== undefined && (typeof n.props !== 'object' || Array.isArray(n.props))) {
    throw new PduiParseError(`${path}.props`, n.props, `"props" must be an object at ${path}`);
  }
  const children: PduiNode[] = [];
  if (n.children !== undefined) {
    if (!Array.isArray(n.children)) {
      throw new PduiParseError(`${path}.children`, n.children, `"children" must be an array at ${path}`);
    }
    n.children.forEach((child: unknown, i: number) => {
      children.push(validateNode(child, `${path}.children.${i}`));
    });
  }
  return {
    type: n.type as string,
    props: n.props as Record<string, unknown> | undefined,
    children: children.length ? children : undefined,
    events: n.events as Record<string, string> | undefined,
    _key: path,
  };
}

export class PduiParser {
  static parse(input: string): PduiDocument {
    let raw: unknown;
    try {
      raw = JSON.parse(input);
    } catch {
      throw new PduiParseError('$', input, 'Invalid JSON');
    }
    if (!raw || typeof raw !== 'object') {
      throw new PduiParseError('$', raw, 'Document must be an object');
    }
    const doc = raw as Record<string, unknown>;
    if (doc.version !== 1) {
      throw new PduiParseError('$.version', doc.version, 'Document version must be 1');
    }
    if (!doc.meta || typeof doc.meta !== 'object') {
      throw new PduiParseError('$.meta', doc.meta, 'Document must have a meta object');
    }
    const meta = doc.meta as Record<string, unknown>;
    if (typeof meta.title !== 'string') {
      throw new PduiParseError('$.meta.title', meta.title, 'meta.title must be a string');
    }
    const root = validateNode(doc.root, 'root');
    return {
      $schema: doc.$schema as string | undefined,
      version: 1,
      meta: { title: meta.title as string, author: meta.author as string | undefined },
      root,
      handlers: doc.handlers as Record<string, null> | undefined,
      renderers: doc.renderers as Record<string, null> | undefined,
    };
  }
}
