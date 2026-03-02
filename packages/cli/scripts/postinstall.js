#!/usr/bin/env node
/**
 * Postinstall script - downloads the correct thoth-core binary
 * 𓅝
 */

import { platform, arch } from 'os';
import { join, dirname } from 'path';
import { existsSync, mkdirSync, createWriteStream, chmodSync } from 'fs';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));

const VERSION = '0.2.3';
const REPO = 'aklo360/thoth-cli';
const BASE_URL = `https://github.com/${REPO}/releases/download/v${VERSION}`;

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

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        download(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function main() {
  const platformKey = getPlatformKey();
  const binaryName = getBinaryName();
  const binDir = join(__dirname, '..', 'bin', platformKey);
  const binaryPath = join(binDir, binaryName);
  
  // Skip if binary already exists
  if (existsSync(binaryPath)) {
    console.log(`✓ thoth-core binary already exists`);
    return;
  }
  
  console.log(`Downloading thoth-core for ${platformKey}...`);
  
  // Create bin directory
  mkdirSync(binDir, { recursive: true });
  
  // Download binary
  const url = `${BASE_URL}/thoth-core-${platformKey}${platform() === 'win32' ? '.exe' : ''}`;
  
  try {
    await download(url, binaryPath);
    
    // Make executable on Unix
    if (platform() !== 'win32') {
      chmodSync(binaryPath, 0o755);
    }
    
    console.log(`✓ Downloaded thoth-core to ${binaryPath}`);
  } catch (error) {
    console.warn(`⚠ Could not download binary: ${error.message}`);
    console.warn(`  You can run in development mode with Python installed.`);
    console.warn(`  Install thoth-core: pip install thoth-core`);
  }
}

main().catch(console.error);
