import { build } from 'esbuild';

// Production server build configuration
await build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: 'dist',
  packages: 'external',
  external: [
    // Exclude vite and all vite-related imports
    'vite',
    '@vitejs/plugin-react',
    '@replit/vite-plugin-runtime-error-modal',
    '@replit/vite-plugin-cartographer',
    // Mark vite.ts as external so it's not bundled
    './vite.js',
    '../vite.config.js'
  ],
  // Don't follow these imports during bundling
  plugins: [{
    name: 'exclude-vite',
    setup(build) {
      // Exclude vite-related files from bundling
      build.onResolve({ filter: /vite\.ts$/ }, args => {
        return { path: args.path, external: true };
      });
      build.onResolve({ filter: /vite\.config\.ts$/ }, args => {
        return { path: args.path, external: true };
      });
    },
  }],
  define: {
    // Ensure NODE_ENV is properly set
    'process.env.NODE_ENV': '"production"'
  }
});

console.log('✓ Server built successfully without vite dependencies');