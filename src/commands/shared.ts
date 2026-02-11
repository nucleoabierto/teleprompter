import path from 'path'

import fs from 'fs-extra'

import { TELEPROMPTER_DIR } from '../config/constants.js'
import { detectConfigs } from '../core/detector.js'

import type { DetectedConfig } from '../core/detector.js'

export interface SharedDeps {
  pathExists: (path: string) => Promise<boolean>
  detectConfigs: (sourcePath: string) => Promise<DetectedConfig[]>
}

const defaultDeps: SharedDeps = {
  pathExists: fs.pathExists.bind(fs),
  detectConfigs,
}

async function loadInstalledConfigs(
  dir?: string,
  deps: SharedDeps = defaultDeps
): Promise<DetectedConfig[]> {
  const teleprompterDir = path.join(dir ?? process.cwd(), TELEPROMPTER_DIR)

  if (!await deps.pathExists(teleprompterDir)) {
    return []
  }

  return deps.detectConfigs(teleprompterDir)
}

export { loadInstalledConfigs }
