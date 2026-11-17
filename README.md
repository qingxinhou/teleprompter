# teleprompter

> **中文界面版本。** 基于 [17xande-dev/teleprompter](https://github.com/17xande-dev/teleprompter)（MIT）。
>
> 与上游的差异：
>
> - 界面文案全部改为简体中文（控制页、显示器页、命令面板、对话框、快捷键文档）。
> - 编辑器库 [wordgard](https://code.haverbeke.berlin/wordgard/wordgard) 已 fork 至 `vendor/wordgard/`，界面词组直接写在库源码里。上游明确不接受 PR，故本仓库独立维护。
>
> 上游 README 原文保留如下。

An open source teleprompter running in your browser. What a time to be alive.

A **control** page holds the script and the controls; one or more **viewer**
displays show it — a window on a second monitor, a tablet on the floor, a laptop
across the room. Scroll position, content, speed, text size, layout, messages
and clocks all stay in sync between them, peer-to-peer. The Go server only
introduces the peers; the script itself never goes through it.

The control page's own pane is deliberately _not_ scroll-synced. The operator
reads ahead of, or behind, the audience; the **Sync** buttons close that gap on
purpose, in either direction.

## Run

The frontend is TypeScript bundled by [Deno](https://deno.com) into
`src/backend/dist`; the Go server embeds that and serves it alongside the
signalling endpoint.

```sh
deno task build            # frontend -> src/backend/dist
cd src/backend && go run . # serve + signalling on :8080
```

Or, while developing, both together with live rebuilds:

```sh
deno task dev              # watch-bundle the frontend AND run the Go server
```

Open <http://localhost:8080>. The control page gives itself a room and shows a
viewer link — open that on any device on the network, or hit **Screen** for a
display on this machine.

With Docker:

```sh
docker compose up --build
```

## Deploy

Production is deployed with [Kamal](https://kamal-deploy.org) to a Docker host
behind a Cloudflare tunnel: `make deploy` runs the tests, then `kamal deploy`
(`config/deploy.yml`). `make logs-prod` follows the logs; `kamal rollback
<version>` goes back. Details, and how to enable TURN, are in
[deploying.md](docs/deploying.md).

## Docs

| Doc                                     | What is in it                                                             |
| --------------------------------------- | ------------------------------------------------------------------------- |
| [operating.md](docs/operating.md)       | Running a service: the script, scrolling, screens, clocks, the controller |
| [shortcuts.md](docs/shortcuts.md)       | Every command, with its keys and pad button                               |
| [themes.md](docs/themes.md)             | Writing your own viewer layout in CSS                                     |
| [architecture.md](docs/architecture.md) | How the pieces fit: signalling, peer topology, what crosses the wire      |
| [deploying.md](docs/deploying.md)       | Docker, Kamal, TLS, TURN, and why HTTPS is worth having                   |
| [development.md](docs/development.md)   | Build, the gates, and how to check a change is real                       |
| [roadmap.md](docs/roadmap.md)           | Open decisions, what is wanted next, ideas                                |

If you are going to change the code, [CLAUDE.md](CLAUDE.md) is the one to read:
it is the long list of constraints that produce no error when you break them.

## Licence

本仓库含两份 MIT 许可的代码，各自的版权声明均已保留：

| 范围             | 许可                  | 版权                                    |
| ---------------- | --------------------- | --------------------------------------- |
| 本仓库           | [MIT](LICENSE)        | Copyright (c) 2024 Alexandre            |
| `vendor/wordgard/` | [MIT](vendor/wordgard/LICENSE) | Copyright (C) 2026 Marijn Haverbeke |

`vendor/wordgard/` 是 wordgard 0.5.2 的副本，改动清单与重新 vendoring 的步骤见 [vendor/wordgard/README.md](vendor/wordgard/README.md)。

