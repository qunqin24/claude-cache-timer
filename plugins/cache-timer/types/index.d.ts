/** Milliseconds since the epoch. */
export type Stamp = number

declare module 'claude-code' {
  interface PluginState {
    'cache-timer': { lastAt: Stamp | null }
  }
}
