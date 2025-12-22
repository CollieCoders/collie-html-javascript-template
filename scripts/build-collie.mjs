// scripts/build-collie.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileToHtml } from '@collie-lang/compiler'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SRC_DIR = path.join(__dirname, '..', 'src', 'collie')
const OUT_DIR = path.join(__dirname, '..', 'public', 'generated')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function buildFile(sourcePath) {
  const source = fs.readFileSync(sourcePath, 'utf8')
  const relName = path.relative(SRC_DIR, sourcePath)
  const baseName = relName.replace(/\.collie$/i, '')
  const outPath = path.join(OUT_DIR, `${baseName}.html`)

  const result = compileToHtml(source, {
    filename: relName,
    pretty: true,
  })

  if (result.diagnostics?.length) {
    console.warn(`Diagnostics for ${relName}:`)
    console.warn(result.diagnostics)
  }

  ensureDir(path.dirname(outPath))
  fs.writeFileSync(outPath, result.code, 'utf8')
  console.log(`✔ Built ${relName} → public/generated/${baseName}.html`)
}

function buildAll() {
  ensureDir(OUT_DIR)

  const entries = fs.readdirSync(SRC_DIR)
  for (const entry of entries) {
    const full = path.join(SRC_DIR, entry)
    const stat = fs.statSync(full)
    if (stat.isFile() && entry.endsWith('.collie')) {
      buildFile(full)
    }
    // if you later add subdirs, recurse here
  }
}

buildAll()
