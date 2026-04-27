import { useEffect, useState } from 'react';
import type { Process } from '../kernel/process/types';
import { useKernel } from './KernelProvider';

export function useProcessList(): ReadonlyArray<Process> {
  const kernel = useKernel();
  const [list, setList] = useState<ReadonlyArray<Process>>(
    () => kernel.processManager.list(),
  );

  useEffect(() => {
    return kernel.processManager.subscribe(() => {
      setList(kernel.processManager.list());
    });
  }, [kernel]);

  return list;
}
