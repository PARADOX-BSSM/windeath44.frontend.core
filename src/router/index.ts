export { RouterProvider, useRouter } from './RouterProvider';
export { matchRoute } from './matchRoute';
export { encodeDeepLink, decodeDeepLink } from './deepLink';
export { navigationFeature } from './navigationFeature';
export { HashHistoryAdapter } from './history/HashHistoryAdapter';
export { BrowserHistoryAdapter } from './history/BrowserHistoryAdapter';
export type {
  RouteDefinition,
  RouteMatch,
  DeepLink,
  RouterContextValue,
  HistoryAdapter,
  RouterMode,
} from './types';

// ViewManager exports
export {
  ViewManagerProvider,
  useViewManager,
  defineViews,
} from './view-manager';
export type {
  ViewDefinition,
  ViewManagerConfig,
  ViewManagerContextValue,
  ViewNavigateOptions,
  ViewManagerFeatureOptions,
  PduiDocument,
} from './view-manager';
