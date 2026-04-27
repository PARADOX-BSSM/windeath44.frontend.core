export type EventMap = Record<string, unknown>;

export interface IPCEvent<TPayload = unknown> {
  channel: string;
  senderPid: number;
  payload: TPayload;
  seq: number;
  timestamp: string;
}

export type ChannelHandler<TPayload> = (event: IPCEvent<TPayload>) => void;

export interface SubscriptionToken {
  readonly channel: string;
  readonly _id: symbol;
  readonly _handler: ChannelHandler<unknown>;
}
