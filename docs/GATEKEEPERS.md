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
| Spotify | `samabrains-os-spotify` | `/gatekeeper/spotify` | OAuth |
| Supabase | `samabrains-os-supabase` | `/gatekeeper/supabase` | OAuth |
| Home Assistant | `samabrains-os-homeassistant` | `/gatekeeper/homeassistant` | User URL + token in-app |
| MCP | `samabrains-os-mcp` | `/gatekeeper/mcp` | Dynamic client registration |
| MCP Portal | `samabrains-os-mcp-portal` | `/gatekeeper/mcp-portal` | Admin portal + MCP OAuth |
| Email | `samabrains-os-email` | `/gatekeeper/email` | Email Routing on `samabrains.com` |

ZoomInfo is **not** deployed (typed Gatekeeper and MCP wiring left out intentionally).

## OAuth setup (required for all 9 OAuth connectors)

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
| `samabrains-os-spotify` | Set (Premium may be required for Web API calls) |
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

Apex `samabrains.com` MX stays on **Zoho** (not replaced). Cloudflare Email Routing is enabled and a Worker rule was created on the ready subdomain:

| Address | Destination Worker |
| --- | --- |
| `os@notify.samabrains.com` | `samabrains-os-email` |

Re-run setup: `node scripts/setup-email-routing.ts`

To use apex `@samabrains.com` mailboxes later, you’d need Cloudflare MX on the apex (conflicts with Zoho) or another ready Email Routing subdomain.

## Connect smoke (2026-09-09)

Smoke from `/gatekeepers` after Access login. **CONNECTED** after this run: Email, Cloudflare, Slack, Linear, Google, Notion, GitHub (7).

| Connector | Result | Notes |
| --- | --- | --- |
| Google | Pass | Already connected (Robert / `rssebambulidde@gmail.com`) |
| GitHub | Pass | Already connected |
| Slack | Pass | Already connected |
| Cloudflare | Pass | Connected as `rssebambulidde` |
| Notion | Pass | Connected as Samabrains Solutions |
| Linear | Pass | Connected as `rssebambulidde` |
| Confluence | Fail | Scopes fixed on OAuth app **Samabrains OS**: Confluence API **24** (classic 8 + granular 16) + User identity (`read:me`, `read:account`). Consent now reaches Authorize, then **Access denied — no Confluence Cloud site** (“Visit atlassian.com to create a site”). Need a Confluence-licensed cloud site on the Atlassian account. |
| Spotify | Fail | Vendor consent OK; callback `/gatekeeper/spotify/oauth` → **1101**. Workers Observability (`samabrains-os-spotify`): `exception` on that path; `$metadata.error` = **“Active premium subscription required for the owner of the app…”** (Spotify Feb 2026 Development Mode rule). Fix: Spotify Premium on the **Developer Dashboard app owner** account (can take hours to propagate). Soft gap: Worker throws uncaught → 1101 instead of a plain error page. |
| Supabase | Partial | OAuth app scopes updated: `organizations:read`, `projects:read`, `database:read|write`, `edge_functions:read`, `storage:read`. Authorize payload now includes those scopes. Dashboard `/dashboard/authorize` UI still stuck on **Loading…** (SPA hang); re-authorize needed after UI works, or approve manually if the page ever renders. |
| Email | Pass (UI + routing) | Gatekeeper UI → **Continue to Email** → connected as **Email Receiver**. Routing rule enabled: `os@notify.samabrains.com` → Worker `samabrains-os-email`; subdomain `notify.samabrains.com` status **ready**. Apex Email Routing status remains **misconfigured** (Zoho MX on apex — expected). Full mailbox smoke (gadget bind + test mail) not run. |
| Home Assistant | Blocked | UI reachable; needs public HA URL + long-lived access token (Workers cannot reach LAN-only HA). |
| MCP Server | Blocked | UI reachable; needs a trusted MCP endpoint URL (+ optional client credentials). No ZoomInfo MCP. |
| MCP Portal | Out of scope | Not in AVAILABLE without `MCP_PORTAL_URL` on `samabrains-os-mcp-portal`. |

## AI models (shared + personal BYOK)

Shared chat models come from `deployment.jsonc` → `aiGateway.providers` (Samabrains: `cloudflare`, `openai`, `anthropic`) via the account AI Gateway `default`. Company pays for shared catalog usage through Unified Billing credits. On that gateway: keep **Authenticated Gateway** on, set **Workers AI Billing** to **Unified billing**, and keep Provider Keys unset for shared providers so OpenAI/Anthropic use Unified Billing.

Personal keys: **AI providers** (`/providers`) — users paste their own tokens; those models bill the user directly even while the shared gateway stays on.

## Admin

Open `https://os.samabrains.com/admin` → Gatekeepers: leave connectors **enabled** once secrets (or Email Routing / HA / MCP config) are in place.

## Custom Gatekeeper

[`packages/custom-gatekeeper`](../packages/custom-gatekeeper/README.md) — update `customGatekeeper.name` / `message` in `deployment.jsonc`, implement capabilities, redeploy.
