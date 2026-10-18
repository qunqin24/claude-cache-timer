# cache-timer

A Claude Code plugin that shows how long the current conversation's prompt cache stays warm, as a live countdown in the status line.

在 Claude Code 状态栏实时显示当前对话的 prompt 缓存还剩多久失效。

```
缓存 52:10              cache is warm
缓存 3:41 · 即将过期     less than 5 minutes left
缓存已过期               cache has expired
```

## Install / 安装

In Claude Code:

```
/plugin marketplace add qunqin24/claude-cache-timer
/plugin install cache-timer@qunqin24
```

Start a new session (or restart the app) and the countdown appears in the status line.

安装后新开会话（或重启 App）即可在状态栏看到倒计时。

## How it works / 原理

- Every main-thread model request that reads or writes the prompt cache refreshes the entry's TTL, so the countdown restarts from the time of that request. Subagent requests use a separate cache and are ignored.
- When a conversation is resumed, the countdown starts from its last response.
- The remaining time is an estimate: the API does not report when an entry expires.

- 主对话每次请求只要读取或写入了缓存，就会刷新缓存有效期，倒计时从这次请求重新开始；子代理用的是另一份缓存，不计入。
- 恢复旧对话时，从上次回复的时间开始计算。
- 剩余时间是推算值，API 不会直接告诉我们缓存何时过期。

## Settings / 配置

| Option | Values | Default |
| --- | --- | --- |
| `ttl` | `1h`, `5m` | `1h` |

Set `ttl` to match your session's cache TTL, from the plugin's row in the config menu or in `~/.claude/settings.json`:

```json
"pluginConfigs": { "cache-timer": { "ttl": "5m" } }
```

## Compatibility / 兼容性

This plugin uses Claude Code's function-hooks API, which is in **early access** and may change between releases without notice. It needs a recent Claude Code (tested on 2.1.286 and 2.1.289); older versions do not load it.

本插件基于 Claude Code 尚处于早期访问阶段的函数钩子接口，接口可能随版本更新变动而导致插件失效；需要较新的 Claude Code（已在 2.1.286、2.1.289 测试），老版本不会加载。

## License

MIT
