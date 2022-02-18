declare module 'virtual:terminal' {
  export const terminal: {
    assert: (assertion: boolean, obj: any) => void
    error: (...obj: any[]) => void
    info: (...obj: any[]) => void
    log: (...obj: any[]) => void
    table: (obj: any) => void
    warn: (...obj: any[]) => void
    group: () => void
    groupEnd: () => void
    time: (id: string) => void
    timeLog: (id: string) => void
    timeEnd: (id: string) => void
    clear: () => void
    count: (label?: string) => void
    countReset: (label?: string) => void
    dir: (object: any) => void
    dirxml: (object: any) => void
  }
  export default terminal
}
