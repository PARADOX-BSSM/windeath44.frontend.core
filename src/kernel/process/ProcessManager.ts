import type { Process, ProcessStatus, SpawnOptions } from './types';

export type ProcessEventType = 'spawn' | 'kill' | 'suspend' | 'resume' | 'status-change';

export interface ProcessEvent {
  type: ProcessEventType;
  process: Process;
}

export type ProcessListener = (event: ProcessEvent) => void;

export class ProcessManager {
  private nextPid = 1;
  private processes = new Map<number, Process>();
  private listeners = new Set<ProcessListener>();

  spawn(options: SpawnOptions): Process {
    const pid = this.nextPid++;
    const process: Process = {
      pid,
      name: options.name,
      status: 'running',
      kind: options.kind,
      parentPid: options.parentPid,
      metadata: { ...options.metadata, spawnedAt: new Date().toISOString() },
    };
    this.processes.set(pid, process);
    this.emit({ type: 'spawn', process });
    return process;
  }

  kill(pid: number): void {
    const process = this.requireProcess(pid);
    if (process.kind === 'system') {
      throw new Error(`Cannot kill system process pid=${pid}`);
    }
    const updated = this.setStatus(pid, 'killed');
    this.processes.delete(pid);
    this.emit({ type: 'kill', process: updated });
  }

  suspend(pid: number): void {
    const current = this.requireProcess(pid);
    if (current.status !== 'running') return;
    const updated = this.setStatus(pid, 'suspended');
    this.emit({ type: 'suspend', process: updated });
  }

  resume(pid: number): void {
    const current = this.requireProcess(pid);
    if (current.status !== 'suspended') return;
    const updated = this.setStatus(pid, 'running');
    this.emit({ type: 'resume', process: updated });
  }

  list(): ReadonlyArray<Process> {
    return Array.from(this.processes.values());
  }

  get(pid: number): Process | undefined {
    return this.processes.get(pid);
  }

  subscribe(listener: ProcessListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setStatus(pid: number, status: ProcessStatus): Process {
    const process = this.requireProcess(pid);
    const updated: Process = { ...process, status };
    this.processes.set(pid, updated);
    this.emit({ type: 'status-change', process: updated });
    return updated;
  }

  private requireProcess(pid: number): Process {
    const p = this.processes.get(pid);
    if (!p) throw new Error(`No process with pid=${pid}`);
    return p;
  }

  private emit(event: ProcessEvent): void {
    for (const listener of Array.from(this.listeners)) {
      listener(event);
    }
  }
}
