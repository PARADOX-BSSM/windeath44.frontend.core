import type { ReactNode } from 'react';

export interface PduiMeta {
  title: string;
  author?: string;
  description?: string;
  created?: string;
}

export interface PduiNode {
  type: string;
  props?: Record<string, unknown>;
  children?: PduiNode[];
  /** "handlers.xxx" 형태의 이벤트 핸들러 참조 */
  events?: Record<string, string>;
  /** 파서가 자동 할당하는 stable React key */
  _key?: string;
}

export interface PduiDocument {
  $schema?: string;
  version: 1;
  meta: PduiMeta;
  root: PduiNode;
  handlers?: Record<string, null>;
  renderers?: Record<string, null>;
}

export type HandlerRegistry = Record<string, ((...args: unknown[]) => void) | undefined>;
export type RendererRegistry = Record<string, ((item: unknown) => ReactNode) | undefined>;
