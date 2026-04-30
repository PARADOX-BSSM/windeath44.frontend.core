import type { AppCategory, AppManifest } from './types';

export class AppRegistry {
  private readonly manifests = new Map<string, AppManifest>();
  private readonly routeIndex = new Map<string, AppManifest>();

  register(manifest: AppManifest): void {
    if (this.manifests.has(manifest.name)) {
      throw new Error(`App "${manifest.name}" is already registered`);
    }
    this.manifests.set(manifest.name, manifest);
    if (manifest.route) {
      this.routeIndex.set(manifest.route, manifest);
    }
  }

  unregister(name: string): void {
    const manifest = this.manifests.get(name);
    if (manifest?.route) {
      this.routeIndex.delete(manifest.route);
    }
    this.manifests.delete(name);
  }

  getByName(name: string): AppManifest | undefined {
    return this.manifests.get(name);
  }

  getByRoute(route: string): AppManifest | undefined {
    return this.routeIndex.get(route);
  }

  list(): AppManifest[] {
    return [...this.manifests.values()];
  }

  listByCategory(category: AppCategory): AppManifest[] {
    return this.list().filter((m) => m.category === category);
  }
}
