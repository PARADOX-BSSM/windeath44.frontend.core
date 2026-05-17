import { createContext, useContext, useEffect, useState } from 'react';
import '../registry/builtins/index.tsx';
import { defaultRegistry, type ComponentRegistry } from '../registry/ComponentRegistry';
import type { HandlerRegistry, PduiDocument, PduiNode, RendererRegistry } from '../schema/types';

export const PduiDataContext = createContext<Record<string, unknown> | null>(null);

export function usePduiData(): Record<string, unknown> {
  const data = useContext(PduiDataContext);
  return data ?? {};
}

export interface PduiScriptModule {
  handlers?: HandlerRegistry;
  data?: () => Record<string, unknown>;
  registerWidgets?: (registry: ComponentRegistry) => void;
}

const scriptCache = new Map<string, Promise<PduiScriptModule>>();

function loadScript(scriptPath: string): Promise<PduiScriptModule> {
  if (scriptCache.has(scriptPath)) return scriptCache.get(scriptPath)!;
  const p = import(/* @vite-ignore */ scriptPath).then((m: any) => {
    if (m.registerWidgets) m.registerWidgets(defaultRegistry);
    return m as PduiScriptModule;
  });
  scriptCache.set(scriptPath, p);
  return p;
}

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
  data?: Record<string, unknown>;
}

export function PduiRenderer({ document, handlers, renderers, registry = defaultRegistry, data }: PduiRendererProps) {
  const scriptPath = document.meta?.script;

  const [scriptModule, setScriptModule] = useState<PduiScriptModule | null>(null);

  useEffect(() => {
    if (!scriptPath) { setScriptModule(null); return; }
    let cancelled = false;
    loadScript(scriptPath).then(m => { if (!cancelled) setScriptModule(m); });
    return () => { cancelled = true; };
  }, [scriptPath]);

  const scriptData = scriptModule?.data?.();
  const scriptHandlers = scriptModule?.handlers;

  const mergedHandlers: HandlerRegistry | undefined =
    handlers && scriptHandlers ? { ...scriptHandlers, ...handlers } :
    handlers ?? scriptHandlers;

  const mergedData: Record<string, unknown> | undefined =
    data && scriptData ? { ...scriptData, ...data } :
    data ?? scriptData;

  const content = (
    <RenderNode
      node={document.root}
      handlers={mergedHandlers}
      renderers={renderers}
      registry={registry}
    />
  );

  if (mergedData) {
    return <PduiDataContext.Provider value={mergedData}>{content}</PduiDataContext.Provider>;
  }
  return content;
}
