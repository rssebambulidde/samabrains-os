# Safe Browsing + Cloudflare OAuth (Samabrains OS)

Chrome may show a **Dangerous site / phishing** interstitial during **Connect Cloudflare**. That is Google Safe Browsing, not Cloudflare Access and not the Workshop free-tier modal.

## Status check (2026-09-11)

Google Transparency Report (**Site status**):

| URL | Status |
| --- | --- |
| `https://os.samabrains.com` | **No unsafe content found** |
| `https://os.samabrains.com/gatekeeper/cloudflare/oauth` | **No unsafe content found** |
| `https://samabrains.com` | Check if Chrome flags apex during marketing redirects |

Last Transparency Report update shown: Aug 11, 2026. Chrome can still warn from a stale local list, a real-time heuristic, or a **different** URL in the popup chain — always copy the address bar URL from the interstitial.

Check again: [Safe Browsing site status](https://transparencyreport.google.com/safe-browsing/search?url=https://os.samabrains.com&hl=en).

**Ops note:** Automated `report_error` submit needs reCAPTCHA in a human browser. If Chrome still warns despite TR “no unsafe content”:

1. Open [Report a page as safe](https://safebrowsing.google.com/safebrowsing/report_error/?hl=en) with the exact interstitial URL.
2. In [Search Console](https://search.google.com/search-console) → Security Issues → Request a review (if any issue is listed).
3. Workaround for admin-only: Edge/Firefox, or Chrome Details → visit this unsafe site (do not coach end users to bypass).

## Clear / appeal a Chrome warning

1. Note the **exact URL** on the Chrome interstitial (Details / address bar).
2. Verify the property in [Google Search Console](https://search.google.com/search-console) (`samabrains.com` domain property or `https://os.samabrains.com/` URL-prefix).
3. Open **Security & Manual Actions → Security Issues**. If issues are listed, fix samples, then **Request a review**.
4. Also submit [Report a page to Safe Browsing](https://safebrowsing.google.com/safebrowsing/report_error/?hl=en):
   - Report type: **This page is safe**
   - URL: the flagged URL (usually `https://os.samabrains.com/gatekeeper/cloudflare/oauth` or `https://os.samabrains.com/`)
   - Details: legitimate Cloudflare OAuth redirect for Samabrains OS; Transparency Report shows no unsafe content.
5. While waiting (often ~1 day for phishing reviews): complete Connect Cloudflare in Edge / Firefox, or Chrome “visit this unsafe site” **only** for your own admin session — do not instruct end users to bypass.

## Cloudflare OAuth publisher domain (amber shield)

Consent text *“This application has not verified ownership of any domain”* is the OAuth **publisher** shield, not Safe Browsing.

**Applied (2026-09-11, ROBERT account):**

1. OAuth client **Samabrains OS** → **Client URL** set to `https://samabrains.com` (was incorrectly `https://os.samabrains.com`, which made apex TXT verification fail).
2. Apex DNS TXT on `samabrains.com` (`@`): `cloudflare_oauth_client_publisher=<token from OAuth clients table>` (token rotates if Client URL changes — copy the current value from the dashboard; do not commit the token).
3. Verification status: **Verified** (apex TXT live; Client URL `https://samabrains.com`).
4. Redirect URI unchanged: `https://os.samabrains.com/gatekeeper/cloudflare/oauth`.
5. After TXT updates, use **Restart Verification** on the client if status stays Failed.

Do not make the client **public** until domain verification succeeds.

## AI Gateway `default` (chat 429)

Root cause for opaque `Error: 429 status code (no body)` after Connect Cloudflare: gateway **Rate Limit** was **50 req / 1 min** and **Spend Limits** **$5 / day**.

**Applied (2026-09-11):**

| Setting | Before | After |
| --- | --- | --- |
| Rate Limit Requests | 50 / 1 minute | **500 / 1 minute** |
| Spend Limits | $5 / day sliding | **$50 / day** sliding |

Workshop also enriches empty-bodied 429 chat errors with a gateway hint and `cf-aig-log-id` when present (deploy Workshop to pick up logging).

### Retest chat (after rate-limit raise)

1. Sign in at `https://os.samabrains.com` (Access OTP).
2. Confirm Connect Cloudflare still shows a funded balance.
3. Send a short message with **Workers AI**; wait ~60s.
4. Send another with **GPT** (or Anthropic).
5. Expect success; if 429 returns, open AI Gateway → Logs (filter status 429 / code 3040) and note provider.

Automated Access OTP was not available in the ops browser session used for this fix — retest in your signed-in Chrome/Edge session.

## Related docs

- Gatekeeper redirect URIs: [GATEKEEPERS.md](GATEKEEPERS.md)
- AI Gateway billing / Connect Cloudflare: [customization.md](customization.md)
