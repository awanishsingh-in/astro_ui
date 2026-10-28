import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve('src')
const skipFiles = new Set(['styles/tokens.css', 'styles/tokens.ts'])
const skipPrefixes = [
  'components/matching/MatchReportBook',
  'components/reports/PaidReportBook',
  'utils/chart-kundali-download',
  'utils/match-report-download',
  'utils/panchang-download',
]

const replacements = [
  [/#07041[aA]/g, 'var(--color-bg)'],
  [/#0[fF]0[cC]24/g, 'var(--color-surface)'],
  [/#1[aA]0[fF]3[dD]/g, 'var(--color-surface-raised)'],
  [/#0[eE]0820/g, 'var(--color-surface)'],
  [/#140[dD]2[cC]/g, 'var(--color-surface)'],
  [/#221[aA]48/g, 'var(--color-surface-raised)'],
  [/#2[aA]2155/g, 'var(--color-surface-raised)'],
  [/#3[aA]3270/g, 'var(--color-border)'],
  [/#6[bB]6298/g, 'var(--color-border-strong)'],
  [/#7[cC]4[dD][fF]{2}/g, 'var(--color-primary)'],
  [/#8[bB]5[cC][fF]{2}/g, 'var(--color-primary-hover)'],
  [/#[cC]4[aA]0[fF]{2}/g, 'var(--color-accent)'],
  [/#3[aA]7[bB][dD]5/g, 'var(--color-info)'],
  [/#5[eE][dD]7[fF]2/g, 'var(--color-info)'],
  [/#[fF]5[fF]2[fF]{2}/g, 'var(--color-text)'],
  [/#[eE][dD][eE]8[fF]{2}/g, 'var(--color-surface-raised)'],
  [/rgba\(\s*124\s*,\s*77\s*,\s*255\s*,/g, 'rgba(212, 165, 55,'],
  [/rgb\(\s*124\s+77\s+255\s*\//g, 'rgb(212 165 55 /'],
  [/rgba\(\s*58\s*,\s*123\s*,\s*213\s*,/g, 'rgba(212, 165, 55,'],
  [/rgba\(\s*94\s*,\s*215\s*,\s*242\s*,/g, 'rgba(127, 167, 232,'],
]

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    const rel = path.relative(root, p).replace(/\\/g, '/')
    if (ent.isDirectory()) {
      if (skipPrefixes.some((s) => rel === s || rel.startsWith(`${s}/`))) continue
      walk(p, out)
    } else if (/\.(tsx?|css)$/.test(ent.name)) {
      if (skipFiles.has(rel)) continue
      if (skipPrefixes.some((s) => rel.startsWith(s))) continue
      out.push(p)
    }
  }
  return out
}

const files = walk(root)
const changedFiles = []
for (const file of files) {
  let src = fs.readFileSync(file, 'utf8')
  let next = src
  for (const [re, value] of replacements) {
    next = next.replace(re, value)
  }
  if (next !== src) {
    fs.writeFileSync(file, next)
    changedFiles.push(path.relative(root, file))
  }
}

console.log(`Updated ${changedFiles.length} files`)
for (const f of changedFiles) console.log(f)
