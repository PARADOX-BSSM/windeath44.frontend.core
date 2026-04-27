import { useEffect, useState } from 'react';
import type { Process } from '../kernel/process/types';
import { useKernel } from './KernelProvider';

export function useProcess(pid: number): Process | undefined {
  const kernel = useKernel();
  const [process, setProcess] = useState<Process | undefined>(
    () => kernel.processManager.get(pid),
  );

  useEffect(() => {
    return kernel.processManager.subscribe((evt) => {
      if (evt.process.pid === pid) {
        setProcess(evt.type === 'kill' ? undefined : evt.process);
      }
    });
  }, [kernel, pid]);

  return process;
}
