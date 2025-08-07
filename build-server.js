import { build } from 'esbuild';

// Production server build - exclude all vite dependencies
const result = await build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node', 
  format: 'esm',
  outdir: 'dist',
  packages: 'external',
  // Exclude all development-only imports
  external: [
    'vite',
    '@vitejs/plugin-react',
    '@replit/vite-plugin-runtime-error-modal', 
    '@replit/vite-plugin-cartographer',
    './vite.js'
  ],
  // Replace vite imports with empty stubs
  plugins: [{
    name: 'exclude-dev-deps',
    setup(build) {
      // Stub out vite.ts completely
      build.onResolve({ filter: /\.\/vite\.js$/ }, () => {
        return { path: 'data:text/javascript,export const setupVite = () => {}; export const log = console.log;', external: false };
      });
      
      // Stub out vite config
      build.onResolve({ filter: /\.\.\/vite\.config$/ }, () => {
        return { path: 'data:text/javascript,export default {};', external: false };
      });
    }
  }],
  define: {
    'process.env.NODE_ENV': '"production"'
  }
}).catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});

console.log('✓ Production server built successfully without vite dependencies');