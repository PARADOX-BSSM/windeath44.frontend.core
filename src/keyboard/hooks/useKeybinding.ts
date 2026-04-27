import { useEffect, useRef } from 'react';
import { useKeymap } from '../KeymapProvider';
import { parseShortcut } from '../parseShortcut';

let _idCounter = 0;

export function useKeybinding(
  shortcut: string,
  handler: (event: KeyboardEvent) => void,
  options?: { pid?: number; description?: string; enabled?: boolean },
): void {
  const { register } = useKeymap();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled) return;
    const combo = parseShortcut(shortcut);
    const unregister = register({
      id: `keybinding-${++_idCounter}`,
      combo,
      description: options?.description,
      pid: options?.pid,
      handler: (e) => handlerRef.current(e),
    });
    return unregister;
  }, [shortcut, enabled, register, options?.pid, options?.description]);
}
