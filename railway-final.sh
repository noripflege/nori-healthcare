#!/bin/bash

echo "🚀 FINAL Railway Build - No npm ci issues!"

# Use npm install instead of npm ci
echo "📦 Installing with npm install..."
npm install --production=false --no-audit --prefer-offline

# Build client
echo "⚛️ Building React client..."
npx vite build

# Build server 
echo "🖥️ Building server..."
npx esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist \
  --target=node18 \
  --minify

# Copy shared
cp -r shared dist/ 2>/dev/null || echo "No shared folder to copy"

# Create the simplest possible package.json
cat > dist/package.json << 'EOF'
{
  "name": "nori-healthcare",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4",
    "express": "^4.22.0",
    "drizzle-orm": "^0.39.0",
    "zod": "^3.24.1",
    "ws": "^8.18.0"
  }
}
EOF

echo "✅ Railway build completed - ready to deploy!"