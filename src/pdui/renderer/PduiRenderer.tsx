import '../registry/builtins/index.tsx';
import { defaultRegistry, type ComponentRegistry } from '../registry/ComponentRegistry';
import type { HandlerRegistry, PduiDocument, PduiNode, RendererRegistry } from '../schema/types';

interface RenderNodeProps {
  node: PduiNode;
  handlers?: HandlerRegistry;
  renderers?: RendererRegistry;
  registry: ComponentRegistry;
}

function resolveHandler(ref: string, handlers?: HandlerRegistry): ((...args: unknown[]) => void) | undefined {
  if (!ref.startsWith('handlers.')) return undefined;
  const key = ref.slice('handlers.'.length);
  return handlers?.[key];
}

function RenderNode({ node, handlers, renderers, registry }: RenderNodeProps) {
  const Component = registry.resolve(node.type);

  const eventProps: Record<string, (...args: unknown[]) => void> = {};
  if (node.events) {
    for (const [eventName, ref] of Object.entries(node.events)) {
      const fn = resolveHandler(ref, handlers);
      if (fn) eventProps[eventName] = fn;
    }
  }

  const children = node.children?.map((child) => (
    <RenderNode key={child._key} node={child} handlers={handlers} renderers={renderers} registry={registry} />
  ));

  if (!Component) {
    // fallback: render unknown-type marker in non-prod environments
    return (
      <div data-pdui-unknown-type={node.type}>
        {children}
      </div>
    );
  }

  return (
    <Component {...(node.props ?? {})} {...eventProps}>
      {children}
    </Component>
  );
}

export interface PduiRendererProps {
  document: PduiDocument;
  handlers?: HandlerRegistry;
  renderers?: RendererRegistry;
  registry?: ComponentRegistry;
}

export function PduiRenderer({ document, handlers, renderers, registry = defaultRegistry }: PduiRendererProps) {
  return (
    <RenderNode
      node={document.root}
      handlers={handlers}
      renderers={renderers}
      registry={registry}
    />
  );
}
