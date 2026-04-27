import type { ReactNode } from 'react';

export interface MenuItemBase {
  id: string;
}

export interface ActionMenuItem extends MenuItemBase {
  type: 'action';
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onClick: () => void;
}

export interface SubMenuItem extends MenuItemBase {
  type: 'submenu';
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  children: MenuItem[];
}

export interface SeparatorMenuItem extends MenuItemBase {
  type: 'separator';
}

export type MenuItem = ActionMenuItem | SubMenuItem | SeparatorMenuItem;

export interface ShowContextMenuOptions {
  x: number;
  y: number;
  items: MenuItem[];
}

export interface ContextMenuContextValue {
  show(options: ShowContextMenuOptions): void;
  hide(): void;
}
