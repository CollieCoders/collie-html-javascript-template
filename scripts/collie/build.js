/**
 * ---------------------------------------------------------------------------
 *  🚨 DO NOT MODIFY THIS FILE (unless you know what you’re doing)
 * ---------------------------------------------------------------------------
 *
 * This script is responsible for compiling all `.collie` template files into
 * HTML partials used by the Collie HTML Runtime (loaded from the CDN).
 *
 * HOW IT WORKS
 * ------------
 * • Recursively finds every `.collie` file in this repo (skipping generated dirs)
 * • Compiles each file using `@collie-lang/compiler`
 * • Outputs HTML partials to:               `public/collie/dist/`
 * • The CDN runtime injects these partials into elements whose IDs end with
 *   `-collie` (e.g., `<div id="hero-collie"></div>` will receive `hero.html`).
 *
 * WHY THIS FILE IS NECESSARY
 * --------------------------
 * The Collie CDN runtime **cannot** compile `.collie` files in the browser.
 * It only injects prebuilt HTML into placeholders. Therefore:
 *
 *   ❗ This build step MUST run before your site can display Collie templates.
 *
 * DEVELOPERS USING THIS TEMPLATE
 * -------------------------------
 * You normally do NOT call this file directly.
 *
 * Instead, run:
 *   • `npm run dev`     → starts dev server + watches `.collie` files
 *   • `npm run collie:build` → builds all partials once (for production)
 *
 * Feel free to customize your `.collie` files,
 * but avoid modifying this script unless you understand the Collie build flow.
 *
 * ---------------------------------------------------------------------------
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileToHtml } from '@collie-lang/compiler'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROJECT_ROOT = path.resolve(__dirname, '../../')
const OUT_DIR = path.join(PROJECT_ROOT, 'public', 'collie', 'dist')
const SKIP_DIR_NAMES = new Set(['node_modules', '.git', 'dist', 'build'])
const SKIP_ABSOLUTE_PATHS = new Set([OUT_DIR])

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/')
}

function stripCollieSuffix(id = '') {
  return id.replace(/-collie$/i, '') || id
}

function deriveTemplateId(metaId, relPath) {
  if (metaId && typeof metaId === 'string') return metaId
  const fallback = stripCollieSuffix(path.basename(relPath, '.collie'))
  return fallback || null
}

function logDiagnostics(label, diagnostics = []) {
  if (!diagnostics?.length) return
  console.warn(`[Collie] Diagnostics for ${label}:`)
  for (const diagnostic of diagnostics) {
    if (typeof diagnostic === 'string') {
      console.warn(`  • ${diagnostic}`)
    } else {
      console.warn(`  • ${diagnostic?.message ?? JSON.stringify(diagnostic)}`)
    }
  }
}

function shouldSkipDirectory(fullPath, entryName) {
  if (SKIP_DIR_NAMES.has(entryName)) return true
  for (const skipPath of SKIP_ABSOLUTE_PATHS) {
    if (fullPath === skipPath) return true
  }
  return false
}

function findCollieFiles(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (shouldSkipDirectory(fullPath, entry.name)) continue
      findCollieFiles(fullPath, results)
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.collie')) {
      results.push(fullPath)
    }
  }
  return results
}

function buildFile(sourcePath) {
  const relFromRoot = toPosixPath(
    path.relative(PROJECT_ROOT, sourcePath) || path.basename(sourcePath)
  )
  try {
    const source = fs.readFileSync(sourcePath, 'utf8')
    const result = compileToHtml(source, {
      filename: relFromRoot,
      pretty: true,
    })

    const id = deriveTemplateId(result?.meta?.id, relFromRoot)
    if (!id) {
      console.warn(`[Collie] Unable to determine id for ${relFromRoot}, skipping.`)
      return
    }

    const outPath = path.join(OUT_DIR, `${id}.html`)
    logDiagnostics(relFromRoot, result?.diagnostics)
    ensureDir(path.dirname(outPath))
    fs.writeFileSync(outPath, result?.code ?? '', 'utf8')
    console.log(`✔ Built ${relFromRoot} → public/collie/dist/${id}.html`)
  } catch (error) {
    console.error(`[Collie] Failed to compile ${relFromRoot}:`, error)
    process.exitCode = 1
  }
}

function buildAll() {
  const packageJsonPath = path.join(PROJECT_ROOT, 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    console.error('[Collie] Could not locate package.json at project root.')
    process.exitCode = 1
    return
  }

  ensureDir(OUT_DIR)
  const collieFiles = findCollieFiles(PROJECT_ROOT)

  if (!collieFiles.length) {
    console.warn('[Collie] No .collie files found to compile.')
    return
  }

  for (const filePath of collieFiles) {
    buildFile(filePath)
  }
}

process.on('uncaughtException', (err) => {
  console.error('[Collie] Uncaught exception:', err)
  process.exitCode = 1
})

buildAll()
