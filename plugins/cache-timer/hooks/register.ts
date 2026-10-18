import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Stamp } from '../types'

// When the main thread's last request read or wrote the prompt cache.
const lastAt = atom({ plugin: 'cache-timer', key: 'lastAt' } as const, null as Stamp | null)

const TTL_MS = { '1h': 60 * 60 * 1000, '5m': 5 * 60 * 1000 } as const
const WARN_MS = 5 * 60 * 1000

const clock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export const register: Register = (on, options) => {
  const ttl = TTL_MS[options.ttl === '5m' ? '5m' : '1h']

  // Nothing to show before the first cached request.
  const describe = (at: Stamp | null, t: Stamp) => {
    if (at === null) return undefined
    const left = at + ttl - t
    if (left <= 0) return '缓存已过期'
    return left <= WARN_MS ? `缓存 ${clock(left)} · 即将过期` : `缓存 ${clock(left)}`
  }

  // Every main-thread request that touched the cache refreshes the entry's TTL.
  on('turn.step', async function* ($, e, next) {
    const r = yield* next(e)
    const u = r.usage
    if (e.agentId === undefined && u && u.cache_read_input_tokens + u.cache_creation_input_tokens > 0) {
      const t = await $.clock.now()
      await update($, lastAt, () => t)
    }
    return r
  })

  // A resumed conversation's cache may still be warm: count from its last response.
  on('classic.SessionStart', async ($, e, next) => {
    if (e.seconds_since_last_response !== undefined && (await read($, lastAt)) === null) {
      const t = (await $.clock.now()) - e.seconds_since_last_response * 1000
      await update($, lastAt, () => t)
    }
    return next(e)
  })

  on('session.start', async ($, e, next) => {
    const result = await next(e)

    const tick = async () => $.ui.status(describe(await read($, lastAt), await $.clock.now()))

    await tick()
    $.clock.every(1000, tick)
    return result
  })
}
