import { lightGray, lightGreen, lightMagenta, lightRed, lightYellow } from 'kolorist'
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import { parseURL } from 'ufo'
import rollupPluginStrip from '@rollup/plugin-strip'
import table from './table'

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

const methods = ['assert', 'error', 'info', 'log', 'table', 'warn'] as const
type Method = typeof methods[number]

const colors = {
  assert: lightGreen,
  error: lightRed,
  info: lightGray,
  log: lightMagenta,
  warn: lightYellow,
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
        const message = decodeURI(search.slice(1)).split('\n').join('\n  ')
        if (pathname[0] === '/') {
          const method = pathname.slice(1) as Method
          if (methods.includes(method)) {
            switch (method) {
              case 'table': {
                const obj = JSON.parse(message)
                const indent = 2
                config.logger.info(`» ${table(obj, indent)}`)
                break
              }
              case 'log': {
                let obj = JSON.parse(message)
                if (Array.isArray(obj))
                  obj = obj.length === 1 ? JSON.stringify(obj[0], null, 2) : obj.toString()
                config.logger.info(colors.log(`» ${obj}`))
                break
              }
              default: {
                const color = colors[method]
                config.logger.info(color(`» ${message}`))
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
  function send(type: string, obj: any) {
    const message = typeof obj === 'object' ? `${JSON.stringify(obj, null, 2)}` : obj.toString()
    fetch(`/__terminal/${type}?${encodeURI(message)}`)
  }
  return {
    assert: (assertion: boolean, obj: any) => assertion && send('assert', obj),
    error: (obj: any) => send('error', obj),
    info: (obj: any) => send('info', obj),
    log: (...obj: any[]) => send('log', obj),
    table: (obj: any) => send('table', obj),
    warn: (obj: any) => send('warn', obj),
  }
}

export default pluginTerminal
