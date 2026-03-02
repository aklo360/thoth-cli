#!/usr/bin/env node
/**
 * Postinstall script - downloads and decompresses the correct thoth-core binary
 * 𓅝
 */

import { platform, arch } from 'os';
import { join, dirname } from 'path';
import { existsSync, mkdirSync, createWriteStream, chmodSync, statSync, unlinkSync } from 'fs';
import { createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));

const VERSION = '0.2.10';
const REPO = 'aklo360/thoth-cli';

// Use jsDelivr CDN for faster downloads (mirrors GitHub releases)
const CDN_URL = `https://cdn.jsdelivr.net/gh/${REPO}@v${VERSION}/releases`;
// Fallback to GitHub releases directly
const GITHUB_URL = `https://github.com/${REPO}/releases/download/v${VERSION}`;

function getPlatformKey() {
  const p = platform();
  const a = arch();
  
  const platformMap = {
    'darwin': 'darwin',
    'linux': 'linux',
    'win32': 'win32',
  };
  
  const archMap = {
    'x64': 'x64',
    'arm64': 'arm64',
  };
  
  return `${platformMap[p]}-${archMap[a]}`;
}

function getBinaryName() {
  return platform() === 'win32' ? 'thoth-core.exe' : 'thoth-core';
}

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        download(response.headers.location).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      resolve(response);
    }).on('error', reject);
  });
}

async function downloadAndDecompress(url, dest) {
  const response = await download(url);
  const gunzip = createGunzip();
  const fileStream = createWriteStream(dest);
  
  await pipeline(response, gunzip, fileStream);
}

async function main() {
  const platformKey = getPlatformKey();
  const binaryName = getBinaryName();
  const binDir = join(__dirname, '..', 'bin', platformKey);
  const binaryPath = join(binDir, binaryName);
  
  // Skip if binary already exists AND has content
  if (existsSync(binaryPath)) {
    const stats = statSync(binaryPath);
    if (stats.size > 1000) { // Real binary is ~18MB, placeholder is 0
      console.log(`✓ thoth-core binary already exists (${(stats.size / 1024 / 1024).toFixed(1)}MB)`);
      return;
    }
    console.log(`Found placeholder, downloading actual binary...`);
    unlinkSync(binaryPath); // Remove placeholder
  }
  
  // Create bin directory
  mkdirSync(binDir, { recursive: true });
  
  // Compressed filename
  const compressedName = `thoth-core-${platformKey}${platform() === 'win32' ? '.exe' : ''}.gz`;
  
  // Try GitHub releases (jsDelivr doesn't serve release assets directly)
  const url = `${GITHUB_URL}/${compressedName}`;
  
  console.log(`Downloading thoth-core for ${platformKey}...`);
  console.log(`  From: ${url}`);
  
  const startTime = Date.now();
  
  try {
    await downloadAndDecompress(url, binaryPath);
    
    // Make executable on Unix
    if (platform() !== 'win32') {
      chmodSync(binaryPath, 0o755);
    }
    
    const stats = statSync(binaryPath);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✓ Downloaded and decompressed (${(stats.size / 1024 / 1024).toFixed(1)}MB) in ${elapsed}s`);
  } catch (error) {
    console.warn(`⚠ Could not download binary: ${error.message}`);
    console.warn(`  You may need to install thoth-core manually.`);
    console.warn(`  Or install via: pip install thoth-core`);
  }
}

main().catch(console.error);
