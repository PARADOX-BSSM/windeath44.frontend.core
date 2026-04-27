import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { KernelProvider } from '../KernelProvider';
import { useProcess } from '../useProcess';
import { useKernel } from '../KernelProvider';
import { _resetKernel } from '../../kernel/Kernel';
import type { SpawnOptions } from '../../kernel/process/types';

beforeEach(() => {
  _resetKernel();
});

const baseOpts: Omit<SpawnOptions, 'name' | 'kind'> = {
  metadata: { displayName: 'Test', version: '0.0.1', packageId: 'test' },
};

function ProcessStatus({ pid }: { pid: number }) {
  const proc = useProcess(pid);
  return <div data-testid="status">{proc?.status ?? 'gone'}</div>;
}

describe('useProcess', () => {
  it('returns process status after spawn', async () => {
    let pid = -1;

    render(
      <KernelProvider
        config={{
          features: [(k) => { pid = k.spawn({ name: 'w', kind: 'app', ...baseOpts }).pid; }],
        }}
      >
        <ProcessStatus pid={2} />
      </KernelProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('running');
    });
    expect(pid).toBe(2);
  });

  it('returns undefined (gone) after kill', async () => {
    let pid = -1;
    let killFn: (() => void) | undefined;

    function Inner() {
      const kernel = useKernel();
      const proc = useProcess(pid);
      killFn = () => kernel.processManager.kill(pid);
      return <div data-testid="status">{proc?.status ?? 'gone'}</div>;
    }

    render(
      <KernelProvider
        config={{
          features: [(k) => { pid = k.spawn({ name: 'w', kind: 'app', ...baseOpts }).pid; }],
        }}
      >
        <Inner />
      </KernelProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('running'));

    act(() => killFn?.());

    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('gone'));
  });
});
