import { build } from 'esbuild';

// Production server build using production entry point
const result = await build({
  entryPoints: ['server/index.prod.ts'],
  bundle: true,
  platform: 'node', 
  format: 'esm',
  outdir: 'dist',
  packages: 'external',
  define: {
    'process.env.NODE_ENV': '"production"'
  }
}).catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});

console.log('✓ Production server built successfully without vite dependencies');