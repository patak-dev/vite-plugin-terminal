import readline from 'readline'
import { lightGray, lightMagenta, lightRed, lightYellow } from 'kolorist'
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import { parseURL } from 'ufo'
import rollupPluginStrip from '@rollup/plugin-strip'
import table from './table'
import { dispatchLog } from './logQueue'

const virtualId = 'virtual:terminal'
const virtualResolvedId = `\0${virtualId}`

const virtualId_console = 'virtual:terminal/console'
const virtualResolvedId_console = `\0${virtualId_console}`

export type FilterPattern = ReadonlyArray<string | RegExp> | string | RegExp | null

export interface Options {
  /**
   * Redirect console logs to terminal
   *
   * @default true
   */
  console?: 'terminal'

  /**
   * Remove logs in production
   *
   * @default true
   */
  strip?: boolean

  /**
   * Filter for modules to be processed to remove logs
   */
  include?: FilterPattern
  /**
   * Filter for modules to not be processed to remove logs
   */
  exclude?: FilterPattern
}

const methods = ['assert', 'error', 'info', 'log', 'table', 'warn', 'clear'] as const
type Method = typeof methods[number]

const colors = {
  log: lightMagenta,
  info: lightGray,
  warn: lightYellow,
  error: lightRed,
  assert: lightRed,
}

const groupText = (text: string, groupLevel: number) => {
  if (groupLevel !== 0)
    return `${'  '.repeat(groupLevel)}${text.split('\n').join(`\n${'  '.repeat(groupLevel)}`)}`
  else
    return text
}

function pluginTerminal(options: Options = {}) {
  const {
    include = /.+\.(js|ts|mjs|cjs|mts|cts)/,
    exclude,
  } = options

  let config: ResolvedConfig
  let virtualModuleCode: string

  const terminal = <Plugin>{
    name: 'vite-plugin-terminal',
    configResolved(_config: ResolvedConfig) {
      config = _config
    },
    resolveId(id = ''): string | undefined {
      if (id === virtualId)
        return virtualResolvedId
      if (id === virtualId_console)
        return virtualResolvedId_console
    },
    load(id: string) {
      if (id === virtualResolvedId) {
        virtualModuleCode ||= generateVirtualModuleCode()
        return virtualModuleCode
      }
      if (id === virtualResolvedId_console)
        return 'import terminal from "virtual:terminal"; globalThis.console = terminal'
    },
    transformIndexHtml: {
      enforce: 'pre',
      transform() {
        if (options.console === 'terminal') {
          return [{
            tag: 'script',
            attrs: { type: 'module', src: '/@id/__x00__virtual:terminal/console' },
          }]
        }
      },
    },
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/__terminal', (req, res) => {
        const { pathname, search } = parseURL(req.url)
        const searchParams = new URLSearchParams(search.slice(1))

        const message = decodeURI(searchParams.get('m') ?? '').split('\n').join('\n  ')
        const time = parseInt(searchParams.get('t') ?? '0')
        const count = parseInt(searchParams.get('c') ?? '0')
        const groupLevel = parseInt(searchParams.get('g') ?? '0')

        if (pathname[0] === '/') {
          const method = pathname.slice(1) as Method
          if (methods.includes(method)) {
            let run
            switch (method) {
              case 'clear': {
                // Use same logic as in Vite
                run = () => {
                  if (process.stdout.isTTY && !process.env.CI) {
                    const repeatCount = process.stdout.rows - 2
                    const blank = repeatCount > 0 ? '\n'.repeat(repeatCount) : ''
                    console.log(blank)
                    readline.cursorTo(process.stdout, 0, 0)
                    readline.clearScreenDown(process.stdout)
                  }
                }
                break
              }
              case 'table': {
                const obj = JSON.parse(message)
                const indent = 2 * (groupLevel + 1)
                run = () => config.logger.info(`» ${table(obj, indent, 2)}`)
                break
              }
              default: {
                const color = colors[method]
                const groupedMessage = groupText(message, groupLevel)
                run = () => config.logger.info(color(`» ${groupedMessage}`))
                break
              }
            }
            dispatchLog({ run, time, count })
          }
        }
        res.end()
      })
    },
  }
  const strip = <Plugin>{
    ...rollupPluginStrip({
      include,
      exclude,
      functions: methods.map(name => `terminal.${name}`),
    }),
    apply: 'build',
  }
  return [terminal, options.strip !== false && strip]
}

function generateVirtualModuleCode() {
  return `export const terminal = ${createTerminal.toString()}()
export default terminal
`
}

function createTerminal() {
  const console = globalThis.console

  let count = 0
  let groupLevel = 0

  const counters = new Map<string, number>()

  const timers = new Map<string, number>()
  function getTimer(id: string) {
    return timers.has(id)
      ? `${id}: ${performance.now() - timers.get(id)!} ms`
      : `Timer ${id} doesn't exist`
  }

  function stringify(obj: any) {
    return typeof obj === 'object' ? `${JSON.stringify(obj)}` : obj.toString()
  }

  function prettyPrint(obj: any) {
    return JSON.stringify(obj, null, 2)
  }

  function stringifyObjs(objs: any[]) {
    const obj = objs.length > 1 ? objs.map(stringify).join(' ') : objs[0]
    return typeof obj === 'object' ? `${prettyPrint(obj)}` : obj.toString()
  }

  function send(type: string, message?: string) {
    const encodedMessage = message ? `&m=${encodeURI(message)}` : ''
    fetch(`/__terminal/${type}?t=${Date.now()}&c=${count++}&g=${groupLevel}${encodedMessage}`)
  }

  return {
    log(...objs: any[]) { send('log', stringifyObjs(objs)) },
    info(...objs: any[]) { send('info', stringifyObjs(objs)) },
    warn(...objs: any[]) { send('warn', stringifyObjs(objs)) },
    error(...objs: any[]) { send('error', stringifyObjs(objs)) },
    assert(assertion: boolean, ...objs: any[]) {
      if (!assertion)
        send('assert', `Assertion failed: ${stringifyObjs(objs)}`)
    },
    table(obj: any) { send('table', prettyPrint(obj)) },
    group() {
      groupLevel++
    },
    groupCollapsed() {
      groupLevel++
    },
    groupEnd() {
      groupLevel && --groupLevel
    },
    time(id: string) {
      timers.set(id, performance.now())
    },
    timeLog(id: string, ...objs: any[]) {
      send('log', `${getTimer(id)} ${stringifyObjs(objs)}`)
    },
    timeEnd(id: string) {
      send('log', getTimer(id))
      timers.delete(id)
    },
    count(label: string) {
      const l = label || 'default'
      const n = (counters.get(l) || 0) + 1
      counters.set(l, n)
      send('log', `${l}: ${n}`)
    },
    countReset(label: string) {
      const l = label || 'default'
      counters.set(l, 0)
      send('log', `${l}: 0`)
    },
    clear() {
      send('clear')
    },
    dir(obj: any) {
      send('log', prettyPrint(obj))
    },
    dirxml(obj: any) {
      send('log', prettyPrint(obj))
    },
    trace(...args: any[]) { console.trace(...args) },
    profile(...args: any[]) { console.profile(...args) },
    profileEnd(...args: any[]) { console.profileEnd(...args) },

  }
}

export default pluginTerminal
