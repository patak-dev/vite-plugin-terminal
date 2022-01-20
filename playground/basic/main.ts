import terminal from 'virtual:terminal'
import './module.js'

function logToTerminal(): void {
  terminal.log('Hey terminal! A message from the browser')
}

logToTerminal()
