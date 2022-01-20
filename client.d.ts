declare module 'virtual:terminal' {
  export const terminal: {
    log: (message: string) => void
    warn: (message: string) => void
    error: (message: string) => void
  }
  export default terminal
}
