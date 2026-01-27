import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
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

// Known Google Chrome installation paths by platform (only Chrome is supported)
const SYSTEM_CHROME_PATHS = {
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    `${process.env.HOME}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
  ],
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env['PROGRAMFILES(X86)']}\\Google\\Chrome\\Application\\chrome.exe`,
  ],
  linux: [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
  ],
}

/**
 * Get the user data directory for storing downloaded Chrome
 */
export function getUserDataPath(): string {
  return join(app.getPath('userData'), 'browser')
}

/**
 * Get path to the config file that stores the downloaded Chrome path
 */
function getChromeConfigPath(): string {
  return join(getUserDataPath(), 'chrome-path.json')
}

/**
 * Save the downloaded Chrome executable path to config
 */
function saveChromePath(executablePath: string): void {
  const configPath = getChromeConfigPath()
  const browserDir = getUserDataPath()

  if (!existsSync(browserDir)) {
    mkdirSync(browserDir, { recursive: true })
  }

  writeFileSync(configPath, JSON.stringify({ executablePath }), 'utf-8')
}

/**
 * Discover Chrome executable in the browser folder (fallback if config doesn't exist)
 */
function discoverDownloadedChrome(): string | null {
  const browserDir = getUserDataPath()
  const chromeDir = join(browserDir, 'chrome')

  if (!existsSync(chromeDir)) {
    return null
  }

  try {
    const { readdirSync } = require('fs')
    const platforms = readdirSync(chromeDir)

    for (const platform of platforms) {
      let executablePath: string | null = null

      if (process.platform === 'darwin') {
        // macOS: chrome/mac_arm-{version}/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing
        const platformDir = join(chromeDir, platform)
        const archDirs = readdirSync(platformDir)

        for (const archDir of archDirs) {
          const appPath = join(
            platformDir,
            archDir,
            'Google Chrome for Testing.app',
            'Contents',
            'MacOS',
            'Google Chrome for Testing'
          )
          if (existsSync(appPath)) {
            executablePath = appPath
            break
          }
        }
      } else if (process.platform === 'win32') {
        // Windows: chrome/win64-{version}/chrome-win64/chrome.exe
        const platformDir = join(chromeDir, platform)
        const archDirs = readdirSync(platformDir)

        for (const archDir of archDirs) {
          const exePath = join(platformDir, archDir, 'chrome.exe')
          if (existsSync(exePath)) {
            executablePath = exePath
            break
          }
        }
      } else if (process.platform === 'linux') {
        // Linux: chrome/linux-{version}/chrome-linux64/chrome
        const platformDir = join(chromeDir, platform)
        const archDirs = readdirSync(platformDir)

        for (const archDir of archDirs) {
          const exePath = join(platformDir, archDir, 'chrome')
          if (existsSync(exePath)) {
            executablePath = exePath
            break
          }
        }
      }

      if (executablePath) {
        // Save for future use
        saveChromePath(executablePath)
        return executablePath
      }
    }
  } catch {
    // Ignore discovery errors
  }

  return null
}

/**
 * Get the path to downloaded Chrome executable from saved config
 */
function getDownloadedChromePath(): string | null {
  const configPath = getChromeConfigPath()

  // First try to read from saved config
  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'))
      const executablePath = config.executablePath

      // Verify the executable still exists
      if (executablePath && existsSync(executablePath)) {
        return executablePath
      }
    } catch {
      // Ignore config read errors
    }
  }

  // Fallback: discover Chrome in the browser folder
  return discoverDownloadedChrome()
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

  // Save the executable path for future reference
  saveChromePath(installedBrowser.executablePath)

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

function getBrowserNameFromPath(_path: string): string {
  return 'Chrome'
}

export function getChromeStatus(): ChromeStatus {
  const systemPath = getSystemChromePath()

  if (systemPath) {
    return {
      available: true,
      source: 'system' as const,
      browser: getBrowserNameFromPath(systemPath),
      path: systemPath,
    }
  }

  const downloadedPath = getDownloadedChromePath()

  if (downloadedPath) {
    return {
      available: true,
      source: 'downloaded' as const,
      browser: 'Chrome',
      path: downloadedPath,
    }
  }

  return { available: false, source: 'none' as const, browser: null, path: null }
}

// Legacy exports for backwards compatibility
export const getChromiumExecutablePath = getChromePath
export const isChromiumAvailable = isChromeAvailable
