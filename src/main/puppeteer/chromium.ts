import { app } from 'electron'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { install, Browser, detectBrowserPlatform, resolveBuildId } from '@puppeteer/browsers'

/**
 * Chrome/Chromium Browser Management
 *
 * Strategy:
 * 1. First check if Chrome is installed on the system
 * 2. If not found, download Chrome for Testing to user data folder
 *
 * This keeps the app lightweight while ensuring Chrome is always available.
 */

// Known Chrome/Chromium-based browser installation paths by platform
const SYSTEM_CHROME_PATHS = {
  darwin: [
    // Google Chrome
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    `${process.env.HOME}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
    // Arc Browser (Chromium-based)
    '/Applications/Arc.app/Contents/MacOS/Arc',
    `${process.env.HOME}/Applications/Arc.app/Contents/MacOS/Arc`,
    // Brave Browser
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    `${process.env.HOME}/Applications/Brave Browser.app/Contents/MacOS/Brave Browser`,
    // Microsoft Edge
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    `${process.env.HOME}/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge`,
    // Chromium
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    `${process.env.HOME}/Applications/Chromium.app/Contents/MacOS/Chromium`,
  ],
  win32: [
    // Google Chrome
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env['PROGRAMFILES(X86)']}\\Google\\Chrome\\Application\\chrome.exe`,
    // Microsoft Edge
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\Application\\msedge.exe`,
    // Brave
    `${process.env.LOCALAPPDATA}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`,
    'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  ],
  linux: [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    '/usr/bin/brave-browser',
    '/usr/bin/microsoft-edge',
  ],
}

/**
 * Get the user data directory for storing downloaded Chrome
 */
export function getUserDataPath(): string {
  return join(app.getPath('userData'), 'browser')
}

/**
 * Get the path to downloaded Chrome executable in user data folder
 */
function getDownloadedChromePath(): string | null {
  const browserDir = getUserDataPath()

  if (!existsSync(browserDir)) {
    return null
  }

  let executablePath: string

  switch (process.platform) {
    case 'darwin':
      if (process.arch === 'arm64') {
        executablePath = join(
          browserDir,
          'chrome',
          'mac_arm-stable',
          'chrome-mac-arm64',
          'Google Chrome for Testing.app',
          'Contents',
          'MacOS',
          'Google Chrome for Testing',
        )
      } else {
        executablePath = join(
          browserDir,
          'chrome',
          'mac-stable',
          'chrome-mac-x64',
          'Google Chrome for Testing.app',
          'Contents',
          'MacOS',
          'Google Chrome for Testing',
        )
      }
      break

    case 'win32':
      executablePath = join(
        browserDir,
        'chrome',
        'win64-stable',
        'chrome-win64',
        'chrome.exe',
      )
      break

    case 'linux':
      executablePath = join(
        browserDir,
        'chrome',
        'linux-stable',
        'chrome-linux64',
        'chrome',
      )
      break

    default:
      return null
  }

  return existsSync(executablePath) ? executablePath : null
}

/**
 * Check if Chrome is installed on the system and return its path
 */
export function getSystemChromePath(): string | null {
  const platform = process.platform as keyof typeof SYSTEM_CHROME_PATHS
  const paths = SYSTEM_CHROME_PATHS[platform] || []

  for (const chromePath of paths) {
    if (chromePath && existsSync(chromePath)) {
      return chromePath
    }
  }

  return null
}

/**
 * Get the Chrome executable path (system or downloaded)
 * Returns null if Chrome is not available
 */
export function getChromePath(): string | null {
  // First, try system Chrome
  const systemChrome = getSystemChromePath()
  if (systemChrome) {
    return systemChrome
  }

  // Then, try downloaded Chrome
  const downloadedChrome = getDownloadedChromePath()
  if (downloadedChrome) {
    return downloadedChrome
  }

  return null
}

/**
 * Check if Chrome is available (either system or downloaded)
 */
export function isChromeAvailable(): boolean {
  return getChromePath() !== null
}

/**
 * Check if system Chrome is installed
 */
export function isSystemChromeInstalled(): boolean {
  return getSystemChromePath() !== null
}

/**
 * Check if Chrome was downloaded to user data folder
 */
export function isDownloadedChromeAvailable(): boolean {
  return getDownloadedChromePath() !== null
}

export interface ChromeDownloadProgress {
  percent: number
  downloadedBytes: number
  totalBytes: number
}

export type ProgressCallback = (progress: ChromeDownloadProgress) => void

/**
 * Download Chrome for Testing to user data folder
 * @param onProgress Optional callback for download progress
 * @returns Path to the downloaded Chrome executable
 */
export async function downloadChrome(onProgress?: ProgressCallback): Promise<string> {
  const browserDir = getUserDataPath()

  // Ensure directory exists
  if (!existsSync(browserDir)) {
    mkdirSync(browserDir, { recursive: true })
  }

  const platform = detectBrowserPlatform()
  if (!platform) {
    throw new Error(`Unsupported platform: ${process.platform} ${process.arch}`)
  }

  // Get the latest stable build ID
  const buildId = await resolveBuildId(Browser.CHROME, platform, 'stable')

  // Download Chrome
  const installedBrowser = await install({
    browser: Browser.CHROME,
    buildId,
    cacheDir: browserDir,
    downloadProgressCallback: onProgress
      ? (downloadedBytes, totalBytes) => {
          const percent = totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) : 0
          onProgress({ percent, downloadedBytes, totalBytes })
        }
      : undefined,
  })

  // Verify installation
  if (!existsSync(installedBrowser.executablePath)) {
    throw new Error(`Chrome installation failed: executable not found at ${installedBrowser.executablePath}`)
  }

  return installedBrowser.executablePath
}

/**
 * Ensure Chrome is available, downloading if necessary
 * @param onProgress Optional callback for download progress
 * @returns Path to Chrome executable
 */
export async function ensureChromeAvailable(onProgress?: ProgressCallback): Promise<string> {
  // Check if already available
  const existingPath = getChromePath()
  if (existingPath) {
    return existingPath
  }

  // Download Chrome
  return downloadChrome(onProgress)
}

/**
 * Get Chrome status for UI display
 */
export interface ChromeStatus {
  available: boolean
  source: 'system' | 'downloaded' | 'none'
  browser: string | null
  path: string | null
}

function getBrowserNameFromPath(path: string): string {
  const lowerPath = path.toLowerCase()
  if (lowerPath.includes('arc')) return 'Arc'
  if (lowerPath.includes('brave')) return 'Brave'
  if (lowerPath.includes('edge') || lowerPath.includes('msedge')) return 'Edge'
  if (lowerPath.includes('chromium')) return 'Chromium'
  if (lowerPath.includes('chrome')) return 'Chrome'
  return 'Browser'
}

export function getChromeStatus(): ChromeStatus {
  const systemPath = getSystemChromePath()
  if (systemPath) {
    return {
      available: true,
      source: 'system',
      browser: getBrowserNameFromPath(systemPath),
      path: systemPath,
    }
  }

  const downloadedPath = getDownloadedChromePath()
  if (downloadedPath) {
    return {
      available: true,
      source: 'downloaded',
      browser: 'Chrome',
      path: downloadedPath,
    }
  }

  return { available: false, source: 'none', browser: null, path: null }
}

// Legacy exports for backwards compatibility
export const getChromiumExecutablePath = getChromePath
export const isChromiumAvailable = isChromeAvailable
