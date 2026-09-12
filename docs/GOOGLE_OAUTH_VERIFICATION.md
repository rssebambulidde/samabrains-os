# Google OAuth verification (Samabrains OS)

Goal: remove the “This app hasn’t been verified by Google” warning when users Connect Google on `https://os.samabrains.com`.

Public branding URLs (must stay **outside** Cloudflare Access):

| Field | URL |
| --- | --- |
| Application home | `https://samabrains.com/os/app/` (login-free OAuth branding home; overview also at `/os/`) |
| Privacy Policy | `https://samabrains.com/privacy/` (section **Samabrains OS and Google user data**) |
| Terms of Service | `https://samabrains.com/terms` |
| OAuth redirect | `https://os.samabrains.com/gatekeeper/google/oauth` |

GCP project: **Samabrains** / `samabrains-1762892695196` · Support / developer contact: `rssebambulidde@gmail.com` (also `info@samabrains.com`).

Authorized domain: `samabrains.com` (Search Console ownership required).

## Scopes to declare (Data Access)

Match [`cloudflare-os/packages/gatekeeper-google/README.md`](../cloudflare-os/packages/gatekeeper-google/README.md):

| Scope | Why (paste into justification) |
| --- | --- |
| `openid` / `userinfo.email` / `userinfo.profile` | Identify the Google account connected to OS. |
| `https://www.googleapis.com/auth/gmail.modify` | Read threads, labels, compose, reply, forward, and send for Gmail resources the user connects. Narrower `gmail.readonly` cannot send; `gmail.send` alone cannot read threads the agent must act on. |
| `https://www.googleapis.com/auth/documents` | Create/edit Google Docs the user binds. |
| `https://www.googleapis.com/auth/documents.readonly` | Read native Docs opened from Drive bindings. |
| `https://www.googleapis.com/auth/drive.metadata.readonly` | Docs/Sheets pickers, account Drive discovery, exact-file metadata. |
| `https://www.googleapis.com/auth/drive.readonly` | Shared-drive picker (`drives.list` / `drives.get`) and native file content within the bound drive. Nothing narrower supports shared-drive listing. |
| `https://www.googleapis.com/auth/spreadsheets.readonly` | Read Sheets metadata and cell ranges the user selects. |
| `https://www.googleapis.com/auth/calendar.calendarlist.readonly` | List calendars in the resource picker. |
| `https://www.googleapis.com/auth/calendar.events` | View/create/edit events on calendars the user selects; free/busy checks. |
| `https://www.googleapis.com/auth/bigquery` | Dry-run and run user-initiated queries (`jobs.insert`); gatekeeper enforces read-only SQL. `bigquery.readonly` is insufficient for dry-runs. |

Application type: **task automation / AI agent platform** (agents act on user-connected tools).

## GCP console checklist

1. [OAuth Branding](https://console.cloud.google.com/auth/branding?project=samabrains-1762892695196) — app name **Samabrains OS**, home / privacy / terms URLs above, logo, support email.
2. Verify branding → Publish branding (within 7 days of Ready).
3. Data Access — add every scope in the table; remove unused OAuth clients from this project.
4. Publish App: Testing → **In production**.
5. Verification Center → prepare verification: paste justifications, docs link to this file or `/os/`, application type, YouTube demo URL.
6. Submit. Watch Owner/Editor + support inboxes for Trust & Safety mail.
7. When Google asks for **CASA**, pick an [empanelled assessor](https://appdefensealliance.dev/casa), complete LOA, re-verify yearly.

While Production + unverified: Google may still show the warning and enforce a user cap until restricted-scope approval + assessment complete.

## Demo video shot list (unlisted YouTube, English UI)

Record desktop capture; keep the OAuth **client ID** visible in the address bar on the consent screen.

1. Open `https://samabrains.com/os/` then `https://os.samabrains.com` (Access sign-in).
2. Connections / Gatekeepers → **Connect Google**.
3. Consent screen: app name **Samabrains OS**, English locale, show scopes.
4. **Gmail:** open/read a thread; send or reply once.
5. **Drive / Docs / Sheets:** pick a file; open or read content.
6. **Calendar:** list calendars; view or create an event.
7. **BigQuery** (if kept in production): run a trivial dry-run/query the user initiates.
8. Narrate: tokens live on the Google Gatekeeper Worker; data used only for the user’s OS actions; disconnect + Google Account permissions revoke access; no selling data (point at Privacy Policy).

Paste the unlisted URL into Verification Center.

### Owner finish line

| Step | Status |
| --- | --- |
| Branding home / privacy / terms live | Done (`/os/app/`, `/privacy/`, `/terms`) |
| Audience **In production** | Done |
| Data Access scopes + justifications | Done |
| Drive / Gmail “What features will you use?” | Done & re-saved (**Drive productivity**, **Email productivity** — Google’s allowed types; not “Task automation”) |
| Brand auto-check appeals (“finding is incorrect”) | Submitted with demo (privacy / home login / purpose false positives) |
| **Unlisted YouTube demo** → Data Access → Save | Done — `https://youtu.be/WA8KHjZ6Rng` |
| Prepare for verification → **Confirm** / Submit | Done — branding + data access **under review** |
| CASA assessor + LOA when Google emails | After restricted-scope approval email |

Demo URL: `https://youtu.be/WA8KHjZ6Rng` (unlisted; House of Anansi channel).

Unverified-app interstitial can still appear until Google finishes review (+ CASA for restricted scopes).

Website git: apex Pages already live; local `personal-website` may still diverge from `origin/main` with unrelated dirty files — say if you want that cleaned up and pushed.

## CASA tracking

| Field | Value |
| --- | --- |
| Status | Branding + data access submitted; waiting for Google review email |
| Assessor | — |
| LOA date | — |
| Next annual reassessment | — |

## Status log

| Date | Note |
| --- | --- |
| 2026-09-12 | Privacy/Terms updated on apex with OS + Limited Use; Pages deploy `b6a15924`. |
| 2026-09-12 | GCP: Audience already **In production**. Branding home → `https://samabrains.com/os/app/` (login-free), privacy/terms set. Data Access scopes declared + saved (identity, sensitive Docs/Sheets/Calendar/BigQuery, restricted Drive + Gmail). |
| 2026-09-12 | Brand auto-check initially failed (privacy content / login-wall / purpose). Fixed public pages + `/os/app/` home; Googlebot UA sees full content. Re-submit branding via **View issues → I have fixed / or Request additional review**. Then **Publish branding**, then Verification Center → Prepare for verification. |
| 2026-09-12 | Uploaded demo MP4 as unlisted YouTube `https://youtu.be/WA8KHjZ6Rng`; saved on Data Access. |
| 2026-09-12 | Branding auto-check still failed (same three findings); appealed “finding is incorrect” + demo URL; answered questionnaire (not personal/internal/staging/SMTP); **Submit for verification**. Verification Center: branding + data access under review. |
| 2026-09-12 | **CASA:** waiting until Google emails after restricted-scope review. |

### Justification drafts (already pasted in console)

**Sensitive (Docs/Sheets/Calendar/BigQuery):** Samabrains OS is an AI agent workspace. Users connect Google Docs/Sheets/Calendar/BigQuery so agents act only on those bindings. documents(+readonly): create/edit Docs and read native Docs from Drive. spreadsheets.readonly: read selected Sheets. calendar.events: view/create/edit events on user-picked calendars. bigquery: jobs.insert for dry-run/queries; bigquery.readonly cannot dry-run. Narrower scopes break these features.

**Drive:** drive.metadata.readonly powers Docs/Sheets pickers and exact-file metadata. drive.readonly is required for shared-drive picker (drives.list/get) and native file content in the bound drive; Google accepts nothing narrower for shared-drive listing. Gatekeeper enforces binding boundaries. Not used for bulk export, ads, or model training.

**Gmail:** gmail.modify lets users connect Gmail so agents can read threads/labels and compose/reply/send. gmail.readonly cannot send; gmail.send alone cannot read threads. Used only for user-initiated OS mail actions under Limited Use; disconnect/revoke deletes tokens.
