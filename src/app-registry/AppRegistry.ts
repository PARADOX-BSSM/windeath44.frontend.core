import type { AppCategory, AppManifest } from './types';

export class AppRegistry {
  private readonly manifests = new Map<string, AppManifest>();

  register(manifest: AppManifest): void {
    if (this.manifests.has(manifest.name)) {
      throw new Error(`App "${manifest.name}" is already registered`);
    }
    this.manifests.set(manifest.name, manifest);
  }

  unregister(name: string): void {
    this.manifests.delete(name);
  }

  getByName(name: string): AppManifest | undefined {
    return this.manifests.get(name);
  }

  list(): AppManifest[] {
    return [...this.manifests.values()];
  }

  listByCategory(category: AppCategory): AppManifest[] {
    return this.list().filter((m) => m.category === category);
  }
}
