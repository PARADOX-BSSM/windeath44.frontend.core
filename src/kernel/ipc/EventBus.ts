import type { EventMap, IPCEvent, ChannelHandler, SubscriptionToken } from './types';

type HandlerSet<TPayload> = Set<ChannelHandler<TPayload>>;
type HandlerMap<TMap extends EventMap> = Partial<{
  [K in keyof TMap]: HandlerSet<TMap[K]>;
}>;

export class EventBus<TMap extends EventMap> {
  private seq = 0;
  private handlers: HandlerMap<TMap> = {};

  publish<K extends keyof TMap & string>(
    channel: K,
    senderPid: number,
    payload: TMap[K],
  ): IPCEvent<TMap[K]> {
    const event: IPCEvent<TMap[K]> = {
      channel,
      senderPid,
      payload,
      seq: ++this.seq,
      timestamp: new Date().toISOString(),
    };

    const set = this.handlers[channel] as HandlerSet<TMap[K]> | undefined;
    if (set) {
      for (const handler of Array.from(set)) {
        handler(event);
      }
    }

    return event;
  }

  subscribe<K extends keyof TMap & string>(
    channel: K,
    handler: ChannelHandler<TMap[K]>,
  ): SubscriptionToken {
    if (!this.handlers[channel]) {
      (this.handlers as Record<string, HandlerSet<unknown>>)[channel] = new Set();
    }
    (this.handlers[channel] as HandlerSet<TMap[K]>).add(handler);

    return {
      channel,
      _id: Symbol(`sub:${channel}`),
      _handler: handler as ChannelHandler<unknown>,
    };
  }

  unsubscribe(token: SubscriptionToken): void {
    const set = this.handlers[token.channel as keyof TMap] as
      | HandlerSet<unknown>
      | undefined;
    if (set) {
      set.delete(token._handler);
      if (set.size === 0) {
        delete this.handlers[token.channel as keyof TMap];
      }
    }
  }
}
