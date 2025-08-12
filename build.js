#!/usr/bin/env node

// Vercel-kompatibles Build-Script
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

console.log('🔨 Building for Vercel...');

try {
  // Ensure dist directory exists
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }

  // Build client with correct root
  console.log('⚛️ Building React client...');
  execSync('npx vite build --config vite.config.ts', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  // Build server
  console.log('🚀 Building server...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --target=node18', { 
    stdio: 'inherit' 
  });
  
  // Copy shared files
  console.log('📁 Copying shared files...');
  try {
    execSync('cp -r shared dist/', { stdio: 'inherit' });
  } catch (e) {
    console.log('No shared folder to copy');
  }
  
  console.log('✅ Vercel build completed!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}