import { lightGray, lightGreen, lightMagenta, lightRed, lightYellow } from 'kolorist'
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import { parseURL } from 'ufo'
import rollupPluginStrip from '@rollup/plugin-strip'
import table from './table'
import { dispatchLog, restartQueue } from './logQueue'

const virtualId = 'virtual:terminal'
const virtualResolvedId = `\0${virtualId}`

export type FilterPattern = ReadonlyArray<string | RegExp> | string | RegExp | null

export interface Options {
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

const methods = ['assert', 'error', 'info', 'log', 'table', 'warn', 'restartQueue'] as const
type Method = typeof methods[number]

const colors = {
  log: lightMagenta,
  info: lightGray,
  warn: lightYellow,
  error: lightRed,
  assert: lightRed,
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
    },
    load(id: string) {
      if (id === virtualResolvedId) {
        virtualModuleCode ||= generateVirtualModuleCode()
        return virtualModuleCode
      }
    },
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/__terminal', (req, res) => {
        const { pathname, search } = parseURL(req.url)
        const [messageURL, queueOrder] = search.slice(1).split('&')
        const message = decodeURI(messageURL).split('\n').join('\n  ')
        if (pathname[0] === '/') {
          const method = pathname.slice(1) as Method
          if (methods.includes(method)) {
            switch (method) {
              case 'restartQueue': {
                restartQueue()
                break
              }
              case 'table': {
                const obj = JSON.parse(message)
                const indent = 2
                dispatchLog({ priority: parseInt(queueOrder), dispatchFunction: () => config.logger.info(`» ${table(obj, indent)}`) })
                break
              }
              default: {
                const color = colors[method]
                dispatchLog({ priority: parseInt(queueOrder), dispatchFunction: () => config.logger.info(color(`» ${method === 'assert' ? 'Assertion failed: ' : ''}${message}`)) })
                break
              }
            }
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
  fetch('/__terminal/restartQueue')
  let queueOrder = 0
  function stringify(obj: any) {
    return typeof obj === 'object' ? `${JSON.stringify(obj)}` : obj.toString()
  }
  function prettyPrint(obj: any) {
    return JSON.stringify(obj, null, 2)
  }
  function send(type: string, ...objs: any[]) {
    switch (type) {
      case 'table': {
        const message = prettyPrint(objs[0])
        fetch(`/__terminal/${type}?${encodeURI(message)}&${queueOrder++}`)
        break
      }
      default: {
        const obj = objs.length > 1 ? objs.map(stringify).join(' ') : objs[0]
        const message = typeof obj === 'object' ? `${prettyPrint(obj)}` : obj.toString()
        fetch(`/__terminal/${type}?${encodeURI(message)}&${queueOrder++}`)
      }
    }
  }
  return {
    log: (...objs: any[]) => send('log', ...objs),
    info: (...objs: any[]) => send('info', ...objs),
    warn: (...objs: any[]) => send('warn', ...objs),
    error: (...objs: any[]) => send('error', ...objs),
    assert: (assertion: boolean, ...objs: any[]) => !assertion && send('assert', ...objs),
    table: (obj: any) => send('table', obj),
  }
}

export default pluginTerminal
