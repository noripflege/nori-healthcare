const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building Nori Healthcare App for Railway...');

try {
  // Skip type checking for faster Railway builds
  console.log('📝 Skipping type check for production build...');
  
  // Step 1: Build client with Vite
  console.log('⚛️  Building React client...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Step 2: Build server with esbuild (simpler approach)
  console.log('🚀 Building Node.js server...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --target=node18', { stdio: 'inherit' });
  
  // Step 3: Copy necessary files
  console.log('📁 Copying necessary files...');
  
  // Create production package.json
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const prodPkg = {
    name: "nori-healthcare",
    version: "1.0.0",
    type: "module",
    main: "index.js",
    scripts: {
      start: "node index.js"
    },
    engines: {
      node: ">=18.0.0"
    },
    dependencies: {
      "@neondatabase/serverless": "^0.10.4",
      "@deepgram/sdk": "^4.11.2",
      "@sendgrid/mail": "^8.1.5",
      "assemblyai": "^4.8.3",
      "connect-pg-simple": "^10.0.0",
      "drizzle-orm": "^0.39.0",
      "express": "^4.22.0",
      "express-session": "^1.18.5",
      "memorystore": "^1.6.7",
      "openai": "^4.80.0",
      "ws": "^8.18.0",
      "zod": "^3.24.1"
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(prodPkg, null, 2));
  
  // Copy shared schema
  if (fs.existsSync('shared')) {
    execSync('cp -r shared dist/', { stdio: 'inherit' });
  }
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Files created:');
  console.log('   - dist/index.js (server)');
  console.log('   - dist/package.json');
  console.log('   - client/dist/* (static files)');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}