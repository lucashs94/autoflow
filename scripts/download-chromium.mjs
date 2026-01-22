import {
  Browser,
  detectBrowserPlatform,
  install,
  resolveBuildId,
} from '@puppeteer/browsers'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CHROMIUM_PATH = path.join(__dirname, '..', 'chromium')
const BROWSER = Browser.CHROME
const BUILD_ID = 'stable'

const args = process.argv.slice(2)
const downloadAll = args.includes('--all')

async function download() {
  console.log(`Downloading Chrome to ${CHROMIUM_PATH}...`)

  if (!fs.existsSync(CHROMIUM_PATH)) {
    fs.mkdirSync(CHROMIUM_PATH, { recursive: true })
  }

  const platforms = []

  if (downloadAll) {
    platforms.push(
      { platform: 'mac_arm', dest: 'mac-arm64' },
      { platform: 'mac', dest: 'mac-x64' },
      { platform: 'win64', dest: 'win-x64' },
      { platform: 'linux', dest: 'linux-x64' },
    )
  } else {
    const currentPlatform = detectBrowserPlatform()
    if (!currentPlatform) {
      throw new Error('Could not detect current platform')
    }

    let dest = ''
    if (currentPlatform === 'mac_arm') dest = 'mac-arm64'
    else if (currentPlatform === 'mac') dest = 'mac-x64'
    else if (currentPlatform === 'win64') dest = 'win-x64'
    else if (currentPlatform === 'linux') dest = 'linux-x64'
    else {
      console.warn(`Platform ${currentPlatform} might not be supported.`)
    }

    if (dest) {
      platforms.push({ platform: currentPlatform, dest })
    }
  }

  for (const { platform, dest } of platforms) {
    console.log(`Installing for ${platform}...`)

    try {
      const buildId = await resolveBuildId(BROWSER, platform, BUILD_ID)
      console.log(`Resolved build ID: ${buildId}`)

      const result = await install({
        browser: BROWSER,
        buildId,
        cacheDir: CHROMIUM_PATH,
        platform,
        unpack: true,
      })

      console.log(`Installed at ${result.path}`)

      const extractionRoot = path.join(
        CHROMIUM_PATH,
        'chrome',
        `${platform}-${buildId}`,
      )
      const targetDir = path.join(CHROMIUM_PATH, dest)

      console.log(`Moving from ${extractionRoot} to ${targetDir}`)

      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true })
      }

      // Ensure parent dir exists
      fs.mkdirSync(path.dirname(targetDir), { recursive: true })

      fs.cpSync(extractionRoot, targetDir, { recursive: true })
      fs.rmSync(extractionRoot, { recursive: true, force: true })
    } catch (error) {
      console.error(`Error installing for ${platform}:`, error)
    }
  }

  const baseBrowserDir = path.join(CHROMIUM_PATH, 'chrome')
  if (fs.existsSync(baseBrowserDir)) {
    try {
      fs.rmdirSync(baseBrowserDir)
    } catch (e) {}
  }

  console.log('Done!')
}

download().catch(console.error)
