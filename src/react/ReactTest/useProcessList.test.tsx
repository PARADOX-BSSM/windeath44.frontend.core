import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { KernelProvider, useKernel } from '../KernelProvider';
import { useProcessList } from '../useProcessList';
import { _resetKernel } from '../../kernel/Kernel';

beforeEach(() => {
  _resetKernel();
});

const meta = { displayName: 'T', version: '0.0.1', packageId: 'test' };

function ProcCount() {
  const list = useProcessList();
  return <div data-testid="count">{list.length}</div>;
}

function SpawnButton() {
  const kernel = useKernel();
  return (
    <button
      data-testid="spawn"
      onClick={() => kernel.spawn({ name: 'app', kind: 'app', metadata: meta })}
    />
  );
}

describe('useProcessList', () => {
  it('shows init process (pid=1) on boot', async () => {
    render(
      <KernelProvider config={{ features: [] }}>
        <ProcCount />
      </KernelProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));
  });

  it('updates when a process is spawned', async () => {
    render(
      <KernelProvider config={{ features: [] }}>
        <ProcCount />
        <SpawnButton />
      </KernelProvider>,
    );
    await waitFor(() => screen.getByTestId('spawn'));
    act(() => screen.getByTestId('spawn').click());
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('2'));
  });

  it('updates when a process is killed', async () => {
    let pid = -1;
    function Killer() {
      const kernel = useKernel();
      return (
        <button
          data-testid="kill"
          onClick={() => kernel.processManager.kill(pid)}
        />
      );
    }

    render(
      <KernelProvider
        config={{ features: [(k) => { pid = k.spawn({ name: 'app', kind: 'app', metadata: meta }).pid; }] }}
      >
        <ProcCount />
        <Killer />
      </KernelProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('2'));
    act(() => screen.getByTestId('kill').click());
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));
  });
});
