export { PduiParser } from './parser/PduiParser';
export { PduiParseError } from './parser/errors';
export { PduiRenderer } from './renderer/PduiRenderer';
export { ComponentRegistry, defaultRegistry } from './registry/ComponentRegistry';
export type { PduiDocument, PduiNode, PduiMeta, HandlerRegistry, RendererRegistry } from './schema/types';
// side-effect: registers builtins into defaultRegistry
import './registry/builtins/index.tsx';
