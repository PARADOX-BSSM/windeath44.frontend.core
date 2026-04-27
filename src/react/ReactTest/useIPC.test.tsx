import { useCallback } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { KernelProvider, useKernel } from '../KernelProvider';
import { useIPCSubscribe, useIPCPublish } from '../useIPC';
import { _resetKernel } from '../../kernel/Kernel';

beforeEach(() => {
  _resetKernel();
});

describe('useIPCSubscribe + useIPCPublish', () => {
  it('subscriber receives published event', async () => {
    const received: string[] = [];
    let publishFn: ((payload: { pid: number; title: string }) => void) | undefined;

    function Publisher() {
      const kernel = useKernel();
      publishFn = useIPCPublish(kernel.initProcess.pid, 'window:open');
      return null;
    }

    function Subscriber() {
      const kernel = useKernel();
      const handler = useCallback(
        (e: { payload: { pid: number; title: string } }) => {
          received.push(e.payload.title);
        },
        [],
      );
      useIPCSubscribe(kernel.initProcess.pid, 'window:open', handler);
      return null;
    }

    render(
      <KernelProvider config={{ features: [] }}>
        <Publisher />
        <Subscriber />
      </KernelProvider>,
    );

    await waitFor(() => expect(publishFn).toBeDefined());
    act(() => publishFn!({ pid: 1, title: 'Hello' }));
    await waitFor(() => expect(received).toContain('Hello'));
  });

  it('unsubscribes on unmount — no further events received', async () => {
    const received: string[] = [];
    let publishFn: ((payload: { pid: number; title: string }) => void) | undefined;

    function Publisher() {
      const kernel = useKernel();
      publishFn = useIPCPublish(kernel.initProcess.pid, 'window:open');
      return null;
    }

    function Subscriber() {
      const kernel = useKernel();
      const handler = useCallback(
        (e: { payload: { pid: number; title: string } }) => {
          received.push(e.payload.title);
        },
        [],
      );
      useIPCSubscribe(kernel.initProcess.pid, 'window:open', handler);
      return null;
    }

    const { unmount } = render(
      <KernelProvider config={{ features: [] }}>
        <Publisher />
        <Subscriber />
      </KernelProvider>,
    );

    await waitFor(() => expect(publishFn).toBeDefined());

    act(() => publishFn!({ pid: 1, title: 'A' }));
    await waitFor(() => expect(received).toContain('A'));

    act(() => unmount());
    act(() => publishFn!({ pid: 1, title: 'B' }));

    await new Promise((r) => setTimeout(r, 50));
    expect(received).not.toContain('B');
  });

  it('useIPCSubscribe baseline — no events before publish', async () => {
    const received: number[] = [];

    function Subscriber() {
      const kernel = useKernel();
      const handler = useCallback(
        (e: { payload: { pid: number; title: string } }) => {
          received.push(e.payload.pid);
        },
        [],
      );
      useIPCSubscribe(kernel.initProcess.pid, 'window:open', handler);
      return null;
    }

    render(
      <KernelProvider config={{ features: [] }}>
        <Subscriber />
      </KernelProvider>,
    );

    await new Promise((r) => setTimeout(r, 30));
    expect(received).toHaveLength(0);
  });
});
