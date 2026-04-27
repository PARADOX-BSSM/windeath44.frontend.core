import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ContextMenuContextValue, MenuItem, ShowContextMenuOptions } from './types';

interface MenuState {
  visible: boolean;
  x: number;
  y: number;
  items: MenuItem[];
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

export function useContextMenu(): ContextMenuContextValue {
  const ctx = useContext(ContextMenuContext);
  if (!ctx) throw new Error('useContextMenu must be used inside <ContextMenuProvider>');
  return ctx;
}

export interface ContextMenuProviderProps {
  children: ReactNode;
}

export function ContextMenuProvider({ children }: ContextMenuProviderProps) {
  const [menu, setMenu] = useState<MenuState>({ visible: false, x: 0, y: 0, items: [] });
  const menuRef = useRef<HTMLDivElement>(null);

  const hide = useCallback(() => {
    setMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  const show = useCallback((options: ShowContextMenuOptions) => {
    setMenu({ visible: true, x: options.x, y: options.y, items: options.items });
  }, []);

  useEffect(() => {
    if (!menu.visible) return;

    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        hide();
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') hide();
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menu.visible, hide]);

  // Clamp position to viewport after render
  useEffect(() => {
    if (!menu.visible || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 1080;
    const nx = Math.min(menu.x, vw - rect.width - 8);
    const ny = Math.min(menu.y, vh - rect.height - 8);
    if (nx !== menu.x || ny !== menu.y) {
      setMenu((prev) => ({ ...prev, x: nx, y: ny }));
    }
  }, [menu.visible, menu.x, menu.y]);

  return (
    <ContextMenuContext.Provider value={{ show, hide }}>
      {children}
      {menu.visible && (
        <ContextMenuList ref={menuRef} items={menu.items} x={menu.x} y={menu.y} onHide={hide} />
      )}
    </ContextMenuContext.Provider>
  );
}

import { forwardRef } from 'react';

interface ContextMenuListProps {
  items: MenuItem[];
  x: number;
  y: number;
  onHide(): void;
}

const ContextMenuList = forwardRef<HTMLDivElement, ContextMenuListProps>(
  ({ items, x, y, onHide }, ref) => {
    return (
      <div
        ref={ref}
        data-windeath44-context-menu
        style={{
          position: 'fixed',
          left: x,
          top: y,
          zIndex: 9999,
          minWidth: 160,
        }}
      >
        {items.map((item) => {
          if (item.type === 'separator') {
            return <hr key={item.id} data-testid="separator" />;
          }
          if (item.type === 'submenu') {
            return (
              <div
                key={item.id}
                data-testid="submenu-item"
                aria-disabled={item.disabled}
                style={{ opacity: item.disabled ? 0.4 : 1 }}
              >
                {item.label} ▶
                {/* submenu rendering handled by hover — simplified for core */}
              </div>
            );
          }
          return (
            <div
              key={item.id}
              role="menuitem"
              aria-disabled={item.disabled}
              style={{ opacity: item.disabled ? 0.4 : 1, cursor: item.disabled ? 'default' : 'pointer' }}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  onHide();
                }
              }}
            >
              {item.label}
              {item.shortcut && <span data-testid="shortcut">{item.shortcut}</span>}
            </div>
          );
        })}
      </div>
    );
  },
);

ContextMenuList.displayName = 'ContextMenuList';
