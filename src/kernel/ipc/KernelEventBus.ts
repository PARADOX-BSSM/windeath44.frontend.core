import { EventBus } from './EventBus';
import type { EventMap, ChannelHandler, SubscriptionToken } from './types';

export class KernelEventBus<TMap extends EventMap> extends EventBus<TMap> {
  private pidIndex = new Map<number, SubscriptionToken[]>();

  subscribeAs<K extends keyof TMap & string>(
    pid: number,
    channel: K,
    handler: ChannelHandler<TMap[K]>,
  ): SubscriptionToken {
    const token = super.subscribe(channel, handler);
    const list = this.pidIndex.get(pid) ?? [];
    list.push(token);
    this.pidIndex.set(pid, list);
    return token;
  }

  purge(pid: number): void {
    const list = this.pidIndex.get(pid) ?? [];
    for (const token of list) {
      super.unsubscribe(token);
    }
    this.pidIndex.delete(pid);
  }
}
