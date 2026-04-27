import type { ComponentType } from 'react';

export class ComponentRegistry {
  private components = new Map<string, ComponentType<Record<string, unknown>>>();

  register(name: string, component: ComponentType<Record<string, unknown>>): void {
    this.components.set(name, component);
  }

  resolve(name: string): ComponentType<Record<string, unknown>> | undefined {
    return this.components.get(name);
  }

  extend(): ComponentRegistry {
    const child = new ComponentRegistry();
    this.components.forEach((comp, name) => child.register(name, comp));
    return child;
  }
}

export const defaultRegistry = new ComponentRegistry();
