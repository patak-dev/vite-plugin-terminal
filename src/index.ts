import { lightGray, lightMagenta, lightRed, lightYellow } from 'kolorist'
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import { parseURL } from 'ufo'
import rollupPluginStrip from '@rollup/plugin-strip'
import table from './table'
import { dispatchLog } from './logQueue'

const virtualId = 'virtual:terminal'
const virtualResolvedId = `\0${virtualId}`

export type FilterPattern = ReadonlyArray<string | RegExp> | string | RegExp | null

interface TimerMap {
  [key: string]: number
}
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
        const searchParams = new URLSearchParams(search.slice(1))
        const messageURL = searchParams.get('m') ?? ''
        const time = parseInt(searchParams.get('t') ?? '0')
        const queueOrder = parseInt(searchParams.get('q') ?? '0')
        const groupLevel = parseInt(searchParams.get('gl') ?? '0')
        const message = decodeURI(messageURL).split('\n').join('\n  ')
        if (pathname[0] === '/') {
          const method = pathname.slice(1) as Method
          if (methods.includes(method)) {
            switch (method) {
              case 'table': {
                const obj = JSON.parse(message)
                const indent = 2 * (groupLevel + 1)
                dispatchLog({ priority: time, queueOrder, dispatchFunction: () => config.logger.info(`» ${table(obj, indent)}`) })
                break
              }
              default: {
                const color = colors[method]
                const groupedMessage = groupText(message, groupLevel)
                dispatchLog({ priority: time, queueOrder, dispatchFunction: () => config.logger.info(color(`» ${groupedMessage}`)) })
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
  let queueOrder = 0
  let groupLevel = 0
  const timers: TimerMap = {}

  const addTimer = (timerId: string) => {
    timers[timerId] = performance.now()
  }

  const getTimer = (timerId: string) => {
    return performance.now() - timers[timerId]
  }

  const finishTimer = (timerId: string) => {
    const time = timers[timerId]
    delete timers[timerId]
    return performance.now() - time
  }

  const getTimersIds = () => {
    return Object.keys(timers)
  }

  function stringify(obj: any) {
    return typeof obj === 'object' ? `${JSON.stringify(obj)}` : obj.toString()
  }
  function prettyPrint(obj: any) {
    return JSON.stringify(obj, null, 2)
  }
  function getTime(id: string, funcToCall: (id: string) => number) {
    if (getTimersIds().includes(id))
      return `${id}: ${funcToCall(id)} ms`
    else
      return `Timer ${id} doesn't exist`
  }
  function send(type: string, ...objs: any[]) {
    switch (type) {
      case 'table': {
        const message = prettyPrint(objs[0])
        fetch(`/__terminal/${type}?m=${encodeURI(message)}&t=${Date.now()}&q=${queueOrder++}&gl=${groupLevel}`)
        break
      }
      case 'group': {
        groupLevel++
        break
      }
      case 'groupEnd': {
        groupLevel && --groupLevel
        break
      }
      case 'time': {
        addTimer(objs[0])
        break
      }
      case 'timeLog': {
        const message = getTime(objs[0], getTimer)
        fetch(`/__terminal/log?m=${encodeURI(message)}&t=${Date.now()}&q=${queueOrder++}&gl=${groupLevel}`)
        break
      }
      case 'timeEnd': {
        const message = getTime(objs[0], finishTimer)
        fetch(`/__terminal/log?m=${encodeURI(message)}&t=${Date.now()}&q=${queueOrder++}&gl=${groupLevel}`)
        break
      }
      default: {
        const obj = objs.length > 1 ? objs.map(stringify).join(' ') : objs[0]
        let message = typeof obj === 'object' ? `${prettyPrint(obj)}` : obj.toString()
        const prefix = type === 'assert' ? 'Assertion failed: ' : ''
        message = prefix + message
        fetch(`/__terminal/${type}?m=${encodeURI(message)}&t=${Date.now()}&q=${queueOrder++}&gl=${groupLevel}`)
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
    group: () => send('group'),
    groupEnd: () => send('groupEnd'),
    time: (obj: any) => send('time', obj),
    timeLog: (obj: any) => send('timeLog', obj),
    timeEnd: (obj: any) => send('timeEnd', obj),
  }
}

export default pluginTerminal
