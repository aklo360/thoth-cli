/**
 * Binary resolution for thoth-core
 * 𓅝
 */

import { platform, arch } from 'os';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Get the platform key for the current system
 */
export function getPlatformKey(): string {
  const p = platform();
  const a = arch();
  
  // Map Node.js platform/arch to our binary names
  const platformMap: Record<string, string> = {
    'darwin': 'darwin',
    'linux': 'linux',
    'win32': 'win32',
  };
  
  const archMap: Record<string, string> = {
    'x64': 'x64',
    'arm64': 'arm64',
  };
  
  const mappedPlatform = platformMap[p];
  const mappedArch = archMap[a];
  
  if (!mappedPlatform || !mappedArch) {
    throw new Error(`Unsupported platform: ${p}-${a}`);
  }
  
  return `${mappedPlatform}-${mappedArch}`;
}

/**
 * Get the binary name for the current platform
 */
export function getBinaryName(): string {
  const p = platform();
  return p === 'win32' ? 'thoth-core.exe' : 'thoth-core';
}

/**
 * Get the path to the thoth-core binary
 */
export function getBinaryPath(): string {
  const platformKey = getPlatformKey();
  const binaryName = getBinaryName();
  
  // Look in various locations
  const possiblePaths = [
    // Installed via npm (production)
    join(__dirname, '..', '..', 'bin', platformKey, binaryName),
    // Development (monorepo)
    join(__dirname, '..', '..', '..', '..', 'bin', platformKey, binaryName),
    // Local development
    join(__dirname, '..', '..', 'bin', binaryName),
  ];
  
  for (const p of possiblePaths) {
    if (existsSync(p)) {
      return p;
    }
  }
  
  // Fallback: try to use Python directly (development mode)
  return 'python';
}

/**
 * Check if we're using the compiled binary or Python fallback
 */
export function isUsingBinary(): boolean {
  const path = getBinaryPath();
  return path !== 'python' && existsSync(path);
}

/**
 * Get the command args for running thoth-core
 */
export function getCommand(): { command: string; args: string[] } {
  const binaryPath = getBinaryPath();
  
  if (binaryPath === 'python') {
    // Development fallback: run Python module directly
    // Use the astro-env Python and set PYTHONPATH
    return {
      command: '/Users/navi/.openclaw-thoth/astro-env/bin/python',
      args: ['-m', 'thoth_core.cli'],
    };
  }
  
  return {
    command: binaryPath,
    args: [],
  };
}
