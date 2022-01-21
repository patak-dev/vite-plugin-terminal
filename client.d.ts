declare module 'virtual:terminal' {
  export type Message = string | Record<string, unknown>
  
  export const terminal: {
    log: (message: Message) => void
    warn: (message: Message) => void
    error: (message: Message) => void
    info: (message: Message) => void
    assert: (assertion: boolean, message: Message) => void
  }
  export default terminal
}
