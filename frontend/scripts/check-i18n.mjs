import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src')
const locales = Object.fromEntries(['ko', 'en', 'ja'].map(language => [
  language,
  JSON.parse(readFileSync(join(root, 'locales', `${language}.json`), 'utf8')),
]))
const keys = Object.keys(locales.ko).sort()
const placeholders = text => [...text.matchAll(/\{\{(\w+)\}\}/g)].map(match => match[1]).sort()
const tags = text => [...new Set([...text.matchAll(/<([a-z]+)[\s/>]/g)].map(match => match[1]))].sort()

for (const [language, messages] of Object.entries(locales)) {
  assert.deepEqual(Object.keys(messages).sort(), keys, `${language}: translation keys differ`)
  for (const key of keys) {
    assert.equal(typeof messages[key], 'string', `${language}.${key}: expected text`)
    assert.ok(messages[key].trim(), `${language}.${key}: empty translation`)
    assert.deepEqual(placeholders(messages[key]), placeholders(locales.ko[key]), `${language}.${key}: interpolation differs`)
    assert.deepEqual(tags(messages[key]), tags(locales.ko[key]), `${language}.${key}: rich text tags differ`)
  }
}

function inspect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) { inspect(path); continue }
    if (!/\.tsx?$/.test(path)) continue
    const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true)
    function visit(node) {
      if (ts.isCallExpression(node) && node.expression.getText(source) === 't' && ts.isStringLiteral(node.arguments[0])) {
        assert.ok(node.arguments[0].text in locales.ko, `${path}: missing key ${node.arguments[0].text}`)
      }
      if (ts.isJsxAttribute(node) && node.name.getText(source) === 'i18nKey' && ts.isStringLiteral(node.initializer)) {
        assert.ok(node.initializer.text in locales.ko, `${path}: missing rich text key ${node.initializer.text}`)
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
}
inspect(root)
console.log(`Checked ${keys.length} messages in Korean, English, and Japanese; UI keys, placeholders, and rich text tags match.`)
