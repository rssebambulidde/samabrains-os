# Gatekeepers (Samabrains OS)

Day-one deploy ships the Cloudflare OS Gatekeeper set (plus Email), without ZoomInfo.
Connectors appear under `/admin` and **Connections** after Access login.

## Inventory

| Connector | Worker | Path | Auth |
| --- | --- | --- | --- |
| Context | `samabrains-os-context` | `/gatekeeper/context` | Ambient (already deployed) |
| Scheduler | `samabrains-os-scheduler` | `/gatekeeper/scheduler` | Ambient (already deployed) |
| Custom | `samabrains-os-custom-gk` | `/gatekeeper/custom` | Example integration |
| GitHub | `samabrains-os-github` | `/gatekeeper/github` | OAuth `CLIENT_ID` + `CLIENT_SECRET` |
| Google | `samabrains-os-google` | `/gatekeeper/google` | OAuth |
| Notion | `samabrains-os-notion` | `/gatekeeper/notion` | OAuth |
| Slack | `samabrains-os-slack` | `/gatekeeper/slack` | OAuth (+ token rotation) |
| Cloudflare | `samabrains-os-cloudflare` | `/gatekeeper/cloudflare` | OAuth |
| Confluence | `samabrains-os-confluence` | `/gatekeeper/confluence` | OAuth |
| Linear | `samabrains-os-linear` | `/gatekeeper/linear` | OAuth |
| Supabase | `samabrains-os-supabase` | `/gatekeeper/supabase` | OAuth |
| Home Assistant | `samabrains-os-homeassistant` | `/gatekeeper/homeassistant` | User URL + token in-app |
| MCP | `samabrains-os-mcp` | `/gatekeeper/mcp` | Dynamic client registration |
| MCP Portal | `samabrains-os-mcp-portal` | `/gatekeeper/mcp-portal` | Access OAuth via portal URL |
| Email | `samabrains-os-email` | `/gatekeeper/email` | Email Routing on `samabrains.com` |

ZoomInfo is **not** deployed (typed Gatekeeper and MCP wiring left out intentionally).
**Spotify** is intentionally **not** deployed (Premium / Development Mode friction); the upstream package remains in the submodule but is omitted from Samabrains `EXTRA_GATEKEEPERS`.

### Observability / Context Artifacts

Enabled in `deployment.jsonc`: Workers invocation logs, traces at 10% head sampling, and `errorReporting.release: "git"` (short SHA at deploy time). See [observability.md](observability.md).

**Context Artifacts:** beta interest submitted 2026-09-10 for account `d77cecb6…` ([form](https://forms.gle/DwBoPRa3CWQ8ajFp7)); Cloudflare says enrollment can take **2–4 weeks**. `artifacts.enabled` stays `false` until `wrangler artifacts namespaces list` works (no feature gate 10004). Then set `enabled: true` (namespace defaults to `gatekeeper-context-collections`) and `pnpm deploy`.

### MCP Server Portal (live)

Zero Trust portal **Samabrains MCP Portal** at `https://mcp.samabrains.com/` (MCP endpoint `https://mcp.samabrains.com/mcp`).

| Setting | Value |
| --- | --- |
| Seed upstream | Cloudflare Docs (`https://docs.mcp.cloudflare.com/mcp`, id `cloudflare-docs`) |
| Access policy | **Samabrains admin** (allow `rssebambulidde@gmail.com`) |
| Worker vars | `deployment.jsonc` → `mcpPortal.url` / `name` / `auth: oauth` → `MCP_PORTAL_*` on `samabrains-os-mcp-portal` |
| Code Mode | Off |

Connect once under `/gatekeepers` → **Samabrains MCP Portal**. Grants must name one upstream server (e.g. Docs), not the whole portal.

## OAuth setup (required for all 8 OAuth connectors)

Homepage (where asked): `https://os.samabrains.com`

Authorization callback for each:

```text
https://os.samabrains.com/gatekeeper/<short>/oauth
```

Examples: `…/gatekeeper/github/oauth`, `…/gatekeeper/google/oauth`.

Provider consoles and steps: each package README under `cloudflare-os/packages/gatekeeper-*`, plus `deploy-inputs.json` where present (GitHub, Google, Notion, Slack).

### Secrets status (Workers)

Verified with `wrangler secret list` (both `CLIENT_ID` and `CLIENT_SECRET` present):

| Worker | CLIENT_ID / CLIENT_SECRET |
| --- | --- |
| `samabrains-os-cloudflare` | Set |
| `samabrains-os-google` | Set |
| `samabrains-os-github` | Set (OAuth App **Samabrains OS**) |
| `samabrains-os-notion` | Set (public OAuth connection **Samabrains OS**) |
| `samabrains-os-slack` | Set (app **Samabrains OS**, redirect + token rotation) |
| `samabrains-os-confluence` | Set (Atlassian OAuth 2.0 **Samabrains OS**; add Confluence API scopes in console) |
| `samabrains-os-linear` | Set (workspace `samabrains`) |
| `samabrains-os-supabase` | Set (org OAuth app **Samabrains OS**) |

Local mirror (gitignored): `deployment.oauth.secrets.jsonc`. Install/update Workers:

```sh
node scripts/put-gatekeeper-secrets.ts
```

### Install secrets

1. Copy [`deployment.oauth.secrets.example.jsonc`](../deployment.oauth.secrets.example.jsonc) → `deployment.oauth.secrets.jsonc` if needed.
2. Paste real Client ID / Secret for **every** OAuth key (no placeholders).
3. Run `node scripts/put-gatekeeper-secrets.ts`.

Secrets live on each Worker in Cloudflare (**Workers → Settings → Variables and Secrets**), not in git.

Manual equivalent:

```sh
pnpm exec wrangler secret put CLIENT_ID --name samabrains-os-github
pnpm exec wrangler secret put CLIENT_SECRET --name samabrains-os-github
```

(Repeat for each `samabrains-os-<short>` OAuth Worker. Prefer Wrangler OAuth; clear a stale `CF_API_TOKEN` if deploys fail.)

### Google APIs (required in GCP)

OAuth Client ID/Secret alone is not enough. In the same Google Cloud project as the OAuth Web client
(**Samabrains** / `samabrains-1762892695196`), enable these APIs under **APIs & Services → Library**:

| API | Service name |
| --- | --- |
| Gmail API | `gmail.googleapis.com` |
| Google Docs API | `docs.googleapis.com` |
| Google Drive API | `drive.googleapis.com` (resource pickers) |
| Google Sheets API | `sheets.googleapis.com` |
| Google Calendar API | `calendar-json.googleapis.com` |
| BigQuery API | `bigquery.googleapis.com` |

Library shortcuts (select the Samabrains project first):

- https://console.cloud.google.com/apis/library/gmail.googleapis.com?project=samabrains-1762892695196
- https://console.cloud.google.com/apis/library/docs.googleapis.com?project=samabrains-1762892695196
- https://console.cloud.google.com/apis/library/drive.googleapis.com?project=samabrains-1762892695196
- https://console.cloud.google.com/apis/library/sheets.googleapis.com?project=samabrains-1762892695196
- https://console.cloud.google.com/apis/library/calendar-json.googleapis.com?project=samabrains-1762892695196
- https://console.cloud.google.com/apis/library/bigquery.googleapis.com?project=samabrains-1762892695196

Also confirm:

- Redirect URI: `https://os.samabrains.com/gatekeeper/google/oauth`
- OAuth consent screen **Testing** → add your Google account(s) as **Test users**

Full setup notes: `cloudflare-os/packages/gatekeeper-google/README.md`.

## Email Routing

**Decision (locked):** Apex `samabrains.com` MX stays on **Zoho**. Cloudflare MX on the apex is **not** planned (it would break Zoho mail).

The permanent Samabrains OS Email Gatekeeper inbound address is:

| Address | Destination Worker |
| --- | --- |
| `os@notify.samabrains.com` | `samabrains-os-email` |

Cloudflare Email Routing is enabled on the ready subdomain `notify.samabrains.com`. Re-run setup: `node scripts/setup-email-routing.ts`.

Apex `@samabrains.com` mailboxes are out of scope for this deployment while Zoho holds apex MX.

## Connect smoke (2026-09-09, updated 2026-09-10)

Smoke from `/gatekeepers` after Access login. **CONNECTED**: Email, Cloudflare, Slack, Linear, Google, Notion, GitHub, Supabase, Confluence, **Samabrains MCP Portal** (10).

| Connector | Result | Notes |
| --- | --- | --- |
| Google | Pass | Connected (Robert / `rssebambulidde@gmail.com`) |
| GitHub | Pass | Connected |
| Slack | Pass | Connected |
| Cloudflare | Pass | Connected as `rssebambulidde` |
| Notion | Pass | Connected as Samabrains Solutions |
| Linear | Pass | Connected as `rssebambulidde` |
| Supabase | Pass | Connected as **ROBERT-SSEBAMBULIDDE's Org** |
| Confluence | Pass | Connected as Robert Ssebambulidde |
| Email | Pass (UI + routing) | Connected as **Email Receiver**. Permanent address: `os@notify.samabrains.com` → `samabrains-os-email`. Apex stays Zoho (no Cloudflare MX). |
| Samabrains MCP Portal | Pass | Connected. Portal `https://mcp.samabrains.com/mcp` with Cloudflare Docs seed. Grant Docs in a workspace to use tools. |
| Home Assistant | **You:** Blocked | No public HA URL/token in session. Provide a **public** HA base URL + long-lived access token, then connect in `/gatekeepers`. |
| MCP Server | Optional | BYO HTTPS MCP URL (+ optional OAuth client id/secret). ZoomInfo MCP still N/A (vendor DCR allowlist). |

### Next actions checklist (account-gated)

1. Paste HA URL + token when ready
2. Optional: grant Cloudflare Docs (via Samabrains MCP Portal) in a workspace and try a read tool
3. Optional: paste a BYO MCP Server URL when ready
4. Optional: email `os@notify.samabrains.com` and confirm gadget receive

### AI Gateway safety (2026-09-10)

On account gateway **`default`**: **Zero Data Retention** enabled; **Spend Limits** on with one rule **$5 / day** (sliding window), gateway-wide. Guardrails left off. Workshop shared-catalog calls send `cf-aig-metadata` with `userId` (profile id) for User Insights attribution.

## AI models (shared + personal BYOK)

Shared chat models come from `deployment.jsonc` → `aiGateway.providers` (Samabrains: `cloudflare`, `openai`, `anthropic`) via the account AI Gateway `default`. Company pays for shared catalog usage through Unified Billing credits. On that gateway: keep **Authenticated Gateway** on, set **Workers AI Billing** to **Unified billing**, and keep Provider Keys unset for shared providers so OpenAI/Anthropic use Unified Billing.

Personal keys: **AI providers** (`/providers`) — users paste their own tokens; those models bill the user directly even while the shared gateway stays on.

## Admin

Open `https://os.samabrains.com/admin` → Gatekeepers: leave connectors **enabled** once secrets (or Email Routing / HA / MCP config) are in place.

## Custom Gatekeeper

[`packages/custom-gatekeeper`](../packages/custom-gatekeeper/README.md) — update `customGatekeeper.name` / `message` in `deployment.jsonc`, implement capabilities, redeploy.
