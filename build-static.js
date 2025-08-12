#!/usr/bin/env node

// Static-only build for Vercel (keine server functions)
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

console.log('🔨 Building static site for Vercel...');

try {
  // Ensure dist directory exists
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }

  // Build client only (no server for static deployment)
  console.log('⚛️ Building React client...');
  execSync('npx vite build --config vite.config.ts', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ Static build completed!');
  console.log('📁 Output directory: dist/public/');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}