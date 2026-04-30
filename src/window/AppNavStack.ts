export interface NavStackEntry {
  path: string;
  state?: unknown;
}

export class AppNavStack {
  private stack: NavStackEntry[] = [];
  private pointer = -1;

  get current(): NavStackEntry | null {
    return this.pointer >= 0 ? this.stack[this.pointer] : null;
  }

  get canBack(): boolean {
    return this.pointer > 0;
  }

  get canForward(): boolean {
    return this.pointer < this.stack.length - 1;
  }

  get entries(): readonly NavStackEntry[] {
    return this.stack.slice(0, this.pointer + 1);
  }

  push(entry: NavStackEntry): void {
    this.stack = this.stack.slice(0, this.pointer + 1);
    this.stack.push(entry);
    this.pointer = this.stack.length - 1;
  }

  back(): NavStackEntry | null {
    if (!this.canBack) return null;
    this.pointer--;
    return this.current;
  }

  forward(): NavStackEntry | null {
    if (!this.canForward) return null;
    this.pointer++;
    return this.current;
  }

  replace(entry: NavStackEntry): void {
    if (this.pointer < 0) {
      this.push(entry);
      return;
    }
    this.stack[this.pointer] = entry;
  }
}