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
  }
  export default terminal
}
