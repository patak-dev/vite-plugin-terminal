import terminal from 'virtual:terminal'
import './module.js'

terminal.log('Hey terminal! A message from the browser')

terminal.time('timer')

const json = { foo: 'bar' }

terminal.group()
terminal.log('Grouped log')
terminal.log('Same indent in group')
terminal.groupEnd()

terminal.log({ json })

terminal.log('First arg', { second: 'arg' })
terminal.assert(true, 'Assertion pass')
terminal.assert(false, 'Assertion fails')

terminal.info('Some info from the app')

terminal.count('counter A')
terminal.count('counter A')
terminal.count('counter B')
terminal.countReset('counter A')
terminal.count('counter A')
terminal.count('counter B')

terminal.table(['vite', 'plugin', 'terminal'])

setTimeout(() => {
  terminal.timeLog('timer', 'message with a timer')
  terminal.timeEnd('timer')
}, 1000)

terminal.log('Properly encoded message %')
