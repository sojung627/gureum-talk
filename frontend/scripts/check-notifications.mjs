import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const source = readFileSync(new URL('../src/notifications.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const shown = []
let permission = 'granted'
let closed = false
let beforeRegister = () => {}
const registration = {
  active: {},
  showNotification: async (title, options) => shown.push({ title, options }),
  getNotifications: async () => [{ close: () => { closed = true } }],
}
let allowFallback = false
function Notification(title, options) {
  if (!allowFallback) throw new Error('Notification constructor unsupported')
  shown.push({ title, options })
}
Object.defineProperty(Notification, 'permission', { get: () => permission })
Notification.requestPermission = async () => permission
const context = {
  exports: {}, Notification, setTimeout, clearTimeout,
  window: { isSecureContext: true, Notification },
  navigator: { serviceWorker: {
    register: async () => { beforeRegister(); return registration },
    getRegistration: async () => registration,
  } },
}
vm.runInNewContext(compiled, context)
const { showAnswerNotification, enableNotifications, closeAnswerNotifications, showTestNotification } = context.exports
const show = condition => showAnswerNotification(7, 'GureumTalk', 'Reply ready', condition)
await show(() => false)
assert.equal(shown.length, 0, 'Off or visible conversation must not notify')
permission = 'denied'
await show(() => true)
assert.equal(shown.length, 0, 'Browser denial must override the app setting')
assert.equal(await enableNotifications(), 'denied')
permission = 'granted'
await show(() => true)
assert.equal(shown.length, 1, 'Enabled background response should notify')
assert.equal(shown[0].options.data.url, '/chat?room=7')
let enabled = true
beforeRegister = () => { enabled = false }
await show(() => enabled)
assert.equal(shown.length, 1, 'Disabling during worker setup must suppress the notification')
beforeRegister = () => { throw new Error('Worker unavailable') }
await show(() => true)
assert.equal(shown.length, 1, 'Notification failure must not reject a successful answer')
allowFallback = true
assert.equal(await show(() => true), true)
assert.equal(shown.length, 2, 'Worker failure should fall back to the desktop API')
beforeRegister = () => {}
assert.equal(await showTestNotification('Test', 'Test body'), true)
assert.equal(shown.length, 3, 'Test notification must work while the settings page is visible')
assert.equal(shown[2].options.data.url, '/features')
registration.active = null
const readyRegistration = { ...registration, active: {} }
context.navigator.serviceWorker.ready = Promise.resolve(readyRegistration)
assert.equal(await show(() => true), true, 'Use the active registration returned by ready')
context.navigator.serviceWorker.ready = new Promise(() => {})
context.setTimeout = callback => { callback(); return 1 }
assert.equal(await show(() => true), true, 'A worker that never activates must time out and fall back')
context.setTimeout = setTimeout
registration.active = {}
await closeAnswerNotifications()
assert.equal(closed, true)
context.window.isSecureContext = false
assert.equal(await enableNotifications(), 'unsupported')
console.log('Notification checks passed: enabled, off, denied, unsupported, click target, disable race, failure isolation, and closing.')
