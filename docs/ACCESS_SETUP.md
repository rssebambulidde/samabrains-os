# Cloudflare Access setup for Samabrains OS

**Status: active** (2026-09-08)

| Setting | Value |
| --- | --- |
| Issuer | `https://samabrains.cloudflareaccess.com` |
| Audience (AUD) | `05474bd20b782dd7b025c432aff1ad6d1ea3b18900a82f47a7f8d725ef8ef215` |
| App | Samabrains OS (`os.samabrains.com`) |
| Policy | Allow admin → `rssebambulidde@gmail.com` |
| Login | One-time PIN (email) |

Configured in [`deployment.jsonc`](../deployment.jsonc) as `access.mode: "access"`.

## After changing Access in the dashboard

Update `access.issuer` / `access.audience` if the app AUD changes, then:

```sh
pnpm run check
pnpm run deploy
```

(Windows: ensure `C:\Program Files\Git\usr\bin` is on PATH for `rm`.)

## Expand who can sign in

Zero Trust → Access controls → Applications → Samabrains OS → edit the **Allow admin** policy (add emails or switch to Emails ending in `@yourdomain.com`).
