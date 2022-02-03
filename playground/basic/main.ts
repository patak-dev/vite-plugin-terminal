import terminal from 'virtual:terminal'
import './module.js'

terminal.log('Hey terminal! A message from the browser')

const json = { foo: 'bar' }

terminal.group()
terminal.log('Grouped log')
terminal.groupEnd()

terminal.log({ json })
terminal.time('firstTimer')
terminal.timeLog('notimer')
terminal.log('First arg', { second: 'arg' })
terminal.assert(true, 'Assertion pass')
terminal.assert(false, 'Assertion fails')

terminal.info('Some info from the app')

terminal.table(['vite', 'plugin', 'terminal'])

setTimeout(() => {
  terminal.timeLog('firstTimer')
  terminal.timeEnd('firstTimer')
  terminal.timeLog('firstTimer')
}, 1000)
