import { magenta } from 'kolorist'
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import { parseURL } from 'ufo'
import { createFilter } from '@rollup/pluginutils'
import rollupPluginStrip from '@rollup/plugin-strip'

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

function pluginTerminal(options: Options = {}) {
  const {
    include = /.[js|ts|mjs|cjs|mts|cts]/,
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
        if (pathname === '/log')
          config.logger.info(magenta(`  » ${decodeURI(search.slice(1))}`))
        res.end()
      })
    },
  }
  const strip = <Plugin>{
    ...rollupPluginStrip({
      include,
      exclude,
      functions: ['terminal.log'],
    }),
    apply: 'build',
  }
  return [terminal, options.strip !== false && strip]
}

function generateVirtualModuleCode() {
  return `export const log = ${log.toString()}
export const terminal = { log }
export default terminal
`
}

function log(message: string) {
  fetch(`/__terminal/log?${encodeURI(message)}`)
}

export default pluginTerminal
