import { useCallback, useEffect } from 'react';
import type { SystemEventMap } from '../kernel/ipc/SystemEventMap';
import type { ChannelHandler, IPCEvent } from '../kernel/ipc/types';
import { useKernel } from './KernelProvider';

export function useIPCSubscribe<K extends keyof SystemEventMap & string>(
  pid: number,
  channel: K,
  handler: ChannelHandler<SystemEventMap[K]>,
): void {
  const kernel = useKernel();

  useEffect(() => {
    const token = kernel.bus.subscribeAs(pid, channel, handler);
    return () => kernel.bus.unsubscribe(token);
    // handler는 호출부에서 useCallback으로 안정화 책임
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kernel, pid, channel]);
}

export function useIPCPublish<K extends keyof SystemEventMap & string>(
  senderPid: number,
  channel: K,
): (payload: SystemEventMap[K]) => IPCEvent<SystemEventMap[K]> {
  const kernel = useKernel();
  return useCallback(
    (payload: SystemEventMap[K]) => kernel.bus.publish(channel, senderPid, payload),
    [kernel, senderPid, channel],
  );
}
