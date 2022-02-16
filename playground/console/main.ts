console.log('Hey terminal! console.log redirected to the terminal')

console.warn('Watch out, warning from the browser')

setTimeout(() => {
  console.error('Ups, testing an error message from the browser')
}, 500)

console.time('timer')

const json = { foo: 'bar' }

console.group()
console.log('Grouped log')
console.log('Same indent in group')
console.groupEnd()

console.log({ json })

console.log('First arg', { second: 'arg' })
console.assert(true, 'Assertion pass')
console.assert(false, 'Assertion fails')

console.info('Some info from the app')

console.table(['vite', 'plugin', 'terminal'])

setTimeout(() => {
  console.timeLog('timer', 'message with a timer')
  console.timeEnd('timer')
}, 1000)
