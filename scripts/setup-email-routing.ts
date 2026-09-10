/**
 * Configure Email Routing rule → samabrains-os-email without touching Zoho apex MX.
 * Uses a Cloudflare Email Routing subdomain that is already ready.
 *
 * Usage: node scripts/setup-email-routing.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const ZONE_NAME = "samabrains.com";
const WORKER_NAME = "samabrains-os-email";
/** Prefer a subdomain already marked ready for Email Routing (apex MX stays on Zoho). */
const MAIL_HOST = "notify.samabrains.com";

function wranglerToken(): string {
  const paths = [
    join(process.env.APPDATA ?? "", "xdg.config/.wrangler/config/default.toml"),
    join(homedir(), ".config/.wrangler/config/default.toml"),
    join(homedir(), "AppData/Roaming/xdg.config/.wrangler/config/default.toml"),
  ];
  for (const p of paths) {
    try {
      const toml = readFileSync(p, "utf8");
      const m = toml.match(/oauth_token\s*=\s*"([^"]+)"/);
      if (m) return m[1];
    } catch {
      /* try next */
    }
  }
  throw new Error("Wrangler OAuth token not found. Run: pnpm exec wrangler login");
}

async function cf(token: string, path: string, init: RequestInit = {}) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string> | undefined),
    },
  });
  const j = await r.json() as {
    success: boolean;
    result?: unknown;
    errors?: { message: string; code?: number }[];
  };
  if (!j.success) {
    throw new Error(`${path}: ${j.errors?.map((e) => e.message).join("; ") ?? r.status}`);
  }
  return j.result;
}

async function main() {
  const token = wranglerToken();
  const zones = await cf(token, `/zones?name=${ZONE_NAME}`) as { id: string }[];
  const zoneId = zones[0]?.id;
  if (!zoneId) throw new Error(`Zone ${ZONE_NAME} not found`);

  const settings = await cf(token, `/zones/${zoneId}/email/routing`) as {
    enabled: boolean;
    status: string;
    subdomains?: { name: string; status: string }[];
  };
  console.log(`Email Routing enabled=${settings.enabled} status=${settings.status}`);
  const sub = settings.subdomains?.find((s) => s.name === MAIL_HOST && s.status === "ready");
  if (!sub) {
    console.log("Available subdomains:", JSON.stringify(settings.subdomains));
    throw new Error(`Expected ready subdomain ${MAIL_HOST}`);
  }
  console.log(`Using ready subdomain ${MAIL_HOST}`);

  const rules = await cf(token, `/zones/${zoneId}/email/routing/rules`) as {
    id: string;
    name?: string;
    matchers: { type: string; field?: string; value?: string }[];
    actions: { type: string; value: string[] }[];
  }[];
  console.log("Existing rules:", JSON.stringify(rules, null, 2));

  const matcherValue = `os@${MAIL_HOST}`;
  const ruleBody = {
    name: "Samabrains OS Email Gatekeeper",
    enabled: true,
    matchers: [{ type: "literal", field: "to", value: matcherValue }],
    actions: [{ type: "worker", value: [WORKER_NAME] }],
  };

  const existing = rules.find((r) =>
    r.name === "Samabrains OS Email Gatekeeper" ||
    r.matchers?.some((m) => m.value === matcherValue) ||
    r.actions?.some((a) => a.type === "worker" && a.value?.includes(WORKER_NAME)));

  if (existing) {
    await cf(token, `/zones/${zoneId}/email/routing/rules/${existing.id}`, {
      method: "PUT",
      body: JSON.stringify(ruleBody),
    });
    console.log(`Updated rule ${existing.id} → ${matcherValue} → ${WORKER_NAME}`);
  } else {
    const created = await cf(token, `/zones/${zoneId}/email/routing/rules`, {
      method: "POST",
      body: JSON.stringify(ruleBody),
    });
    console.log(`Created rule → ${matcherValue} → ${WORKER_NAME}`, JSON.stringify(created));
  }

  console.log(`
Email Gatekeeper inbound address: ${matcherValue}
Apex MX remains Zoho (not changed). Cloudflare Email Routing receives mail on ${MAIL_HOST}.
`);
}

main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
