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
    time: (obj: string) => void
    timeLog: (obj: string) => void
    timeEnd: (obj: string) => void
    clear: () => void
  }
  export default terminal
}
