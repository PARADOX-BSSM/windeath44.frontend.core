import type { ComponentType } from 'react';
import type { PduiDocument } from '../../pdui';

export type { PduiDocument };

/**
 * View definition - either PDUi-based or component-based
 */
export interface ViewDefinition<ViewName extends string = string> {
  name: ViewName;
  /** Pre-parsed PDUi document for declarative rendering */
  pduiDocument?: PduiDocument;
  /** Direct React component for imperative rendering */
  component?: ComponentType<{ viewData?: unknown }>;
  /** Default data to pass to the view */
  defaultData?: unknown;
}

/**
 * Configuration for a ViewManager instance
 */
export interface ViewManagerConfig<ViewName extends string = string> {
  /** All available views for this app */
  views: ViewDefinition<ViewName>[];
  /** Initial view to display */
  initialView: ViewName;
  /** Initial data for the first view */
  initialData?: unknown;
  /** Maximum history stack size (default: 50) */
  maxHistorySize?: number;
}

/**
 * Navigation options when switching views
 */
export interface ViewNavigateOptions {
  /** Replace current view instead of pushing to history */
  replace?: boolean;
  /** Data to pass to the new view */
  data?: unknown;
  /** Skip adding to history (for transient views like loading) */
  skipHistory?: boolean;
}

/**
 * Context value provided by ViewManagerProvider
 */
export interface ViewManagerContextValue<ViewName extends string = string> {
  /** Current active view name */
  currentView: ViewName;
  /** Current view definition */
  currentViewDef: ViewDefinition<ViewName>;
  /** Data for current view */
  viewData: unknown;
  /** View history stack (for back navigation) */
  viewHistory: ViewName[];
  /** Navigate to a new view */
  navigate: (view: ViewName, options?: ViewNavigateOptions) => void;
  /** Go back to previous view */
  back: () => void;
  /** Check if back navigation is possible */
  canBack: () => boolean;
  /** Replace current view data */
  setData: (data: unknown) => void;
}

/**
 * Feature options for integrating ViewManager with kernel
 */
export interface ViewManagerFeatureOptions {
  /** Enable IPC events for view changes */
  enableIpcEvents?: boolean;
}