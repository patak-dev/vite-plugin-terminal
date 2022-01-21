declare module 'virtual:terminal' {

  export const terminal: {
    log: (obj: any) => void
    warn: (obj: any) => void
    error: (obj: any) => void
    info: (obj: any) => void
    assert: (assertion: boolean, obj: any) => void
  }
  export default terminal
}
