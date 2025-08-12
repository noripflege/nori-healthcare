// Simple Node.js build script that works without complex nixpacks
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔨 Simple Railway Build...');

try {
  // Build client
  console.log('⚛️  Building client...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Build server with esbuild
  console.log('🚀 Building server...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --target=node18', { stdio: 'inherit' });
  
  // Create simple package.json for production
  const simplePkg = {
    "name": "nori-healthcare",
    "version": "1.0.0",
    "type": "module",
    "main": "index.js",
    "scripts": {
      "start": "node index.js"
    },
    "dependencies": {
      "@neondatabase/serverless": "*",
      "@deepgram/sdk": "*",
      "express": "*",
      "drizzle-orm": "*",
      "zod": "*"
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(simplePkg, null, 2));
  
  // Copy shared files if they exist
  if (fs.existsSync('shared')) {
    execSync('cp -r shared dist/');
  }
  
  console.log('✅ Simple build completed!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}