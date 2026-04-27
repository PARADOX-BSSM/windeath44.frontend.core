import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { KernelProvider, useKernel } from '../KernelProvider';
import { _resetKernel } from '../../kernel/Kernel';

beforeEach(() => {
  _resetKernel();
});

function DisplayPid() {
  const kernel = useKernel();
  return <div data-testid="pid">{kernel.initProcess.pid}</div>;
}

describe('KernelProvider', () => {
  it('renders children after boot', async () => {
    render(
      <KernelProvider config={{ features: [] }}>
        <div data-testid="child">ready</div>
      </KernelProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('child')).toBeTruthy());
  });

  it('renders fallback while booting', () => {
    render(
      <KernelProvider config={{ features: [] }} fallback={<div data-testid="loading" />}>
        <div data-testid="child" />
      </KernelProvider>,
    );
    expect(screen.getByTestId('loading')).toBeTruthy();
  });

  it('provides kernel via useKernel', async () => {
    render(
      <KernelProvider config={{ features: [] }}>
        <DisplayPid />
      </KernelProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('pid').textContent).toBe('1');
    });
  });

  it('useKernel throws outside provider', () => {
    const original = console.error;
    console.error = () => {};
    expect(() => render(<DisplayPid />)).toThrow();
    console.error = original;
  });

  it('runs feature bootstrap functions on boot', async () => {
    const spawned: string[] = [];
    render(
      <KernelProvider
        config={{
          features: [
            (k) => { k.spawn({ name: 'svc', kind: 'service', metadata: { displayName: 'Svc', version: '0.0.1', packageId: 'test' } }); spawned.push('svc'); },
          ],
        }}
      >
        <div data-testid="done" />
      </KernelProvider>,
    );
    await waitFor(() => screen.getByTestId('done'));
    expect(spawned).toContain('svc');
  });
});
