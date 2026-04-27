import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'react/index': 'src/react/index.ts',
    'window/index': 'src/window/index.ts',
    'shell/index': 'src/shell/index.ts',
    'router/index': 'src/router/index.ts',
    'vfs/index': 'src/vfs/index.ts',
    'notifications/index': 'src/notifications/index.ts',
    'context-menu/index': 'src/context-menu/index.ts',
    'drag-drop/index': 'src/drag-drop/index.ts',
    'pdui/index': 'src/pdui/index.ts',
    'ssr/index': 'src/ssr/index.ts',
    'theme/index': 'src/theme/index.ts',
    'keyboard/index': 'src/keyboard/index.ts',
    'clipboard/index': 'src/clipboard/index.ts',
    'app-registry/index': 'src/app-registry/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
});
