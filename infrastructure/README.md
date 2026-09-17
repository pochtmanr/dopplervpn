# infrastructure/

What remains here is the **editorial blog pipeline** — n8n workflows that research topics,
generate content and images, publish through the site's Blog API and distribute to Telegram.

| Path | What it is |
|---|---|
| `SETUP.md` | Blog pipeline setup guide |
| `n8n-workflows/` | Workflow definitions (topic discovery, content generation, image pipeline, publish & distribute, support bot) |
| `scripts/` | Workflow deployment and pipeline status helpers |

## The VPN server side moved

`xray/`, `relay/`, `node-sync/` and `monitoring/` were removed from this repository on
2026-09-17 and now live in **`pochtmanr/doppler-infra`** (private).

This repository is public. Those directories held node IP addresses, the REALITY configuration
and the flagged-domain routing rules — for a censorship-circumvention product, that is the fleet's
topology, and publishing it tells a censor what to block.

Removing them from `HEAD` does not un-publish them: they remain in this repository's history,
GitHub's public event feed already carried the original pushes, and forks or mirrors may hold
copies. **Treat every node IP and relay hostname committed before 2026-09-17 as disclosed.**

No credentials were ever tracked here — only `.example` templates.
