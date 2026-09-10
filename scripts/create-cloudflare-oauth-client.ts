/**
 * Create Cloudflare OAuth client for Samabrains OS Gatekeeper + write CLIENT_ID/SECRET.
 * Usage: node scripts/create-cloudflare-oauth-client.ts
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { resolveBinEntry } from "../cloudflare-os/scripts/bin-entry.ts";

const ACCOUNT_ID = "d77cecb6dcb60741b68f2f1f59f897d2";
const WORKER = "samabrains-os-cloudflare";
const REDIRECT = "https://os.samabrains.com/gatekeeper/cloudflare/oauth";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

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
    } catch { /* next */ }
  }
  throw new Error("Wrangler OAuth token not found");
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
    result?: Record<string, unknown>;
    errors?: { message: string; code?: number }[];
  };
  return { ok: j.success, result: j.result, errors: j.errors, status: r.status };
}

function putSecret(name: string, value: string) {
  const entry = resolveBinEntry(root, "wrangler");
  const env = { ...process.env, CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID, CF_API_TOKEN: "" };
  const args = entry
    ? [entry, "secret", "put", name, "--name", WORKER]
    : null;
  const result = entry
    ? spawnSync(process.execPath, args!, {
      cwd: root, env, input: Buffer.from(value), stdio: ["pipe", "inherit", "inherit"],
    })
    : spawnSync("pnpm", ["exec", "wrangler", "secret", "put", name, "--name", WORKER], {
      cwd: root, env, input: Buffer.from(value), stdio: ["pipe", "inherit", "inherit"], shell: true,
    });
  if (result.status !== 0) throw new Error(`secret put ${name} failed`);
}

async function main() {
  const token = wranglerToken();

  // Scopes used by gatekeeper-cloudflare (billing + observability + identity).
  const body = {
    client_name: "Samabrains OS",
    grant_types: ["authorization_code", "refresh_token"],
    redirect_uris: [REDIRECT],
    response_types: ["code"],
    token_endpoint_auth_method: "client_secret_post",
    client_uri: "https://os.samabrains.com",
    scopes: [
      "user-details.read",
      "workers-observability.read",
      "ai-gateway.run",
      "offline_access",
    ],
  };

  let created = await cf(token, `/accounts/${ACCOUNT_ID}/oauth_clients`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!created.ok) {
    // Retry with fewer scopes if some are invalid for this token/account.
    console.log("First create failed:", JSON.stringify(created.errors));
    created = await cf(token, `/accounts/${ACCOUNT_ID}/oauth_clients`, {
      method: "POST",
      body: JSON.stringify({
        ...body,
        scopes: ["account", "user", "workers", "offline_access"],
      }),
    });
  }

  if (!created.ok) {
    throw new Error(`OAuth client create failed: ${JSON.stringify(created.errors)}`);
  }

  const clientId = String(created.result?.client_id ?? created.result?.id ?? "");
  const clientSecret = String(created.result?.client_secret ?? "");
  if (!clientId || !clientSecret) {
    throw new Error(`Missing client credentials in response keys: ${Object.keys(created.result ?? {})}`);
  }

  console.log(`Created Cloudflare OAuth client ${clientId}`);
  putSecret("CLIENT_ID", clientId);
  putSecret("CLIENT_SECRET", clientSecret);

  // Merge into secrets file for the put-all script.
  const secretsPath = join(root, "deployment.oauth.secrets.jsonc");
  const examplePath = join(root, "deployment.oauth.secrets.example.jsonc");
  let data: Record<string, { CLIENT_ID: string; CLIENT_SECRET: string }> = {};
  if (existsSync(secretsPath)) {
    data = JSON.parse(readFileSync(secretsPath, "utf8").replace(/^\s*\/\/.*$/gm, ""));
  } else {
    data = JSON.parse(readFileSync(examplePath, "utf8").replace(/^\s*\/\/.*$/gm, ""));
  }
  data.cloudflare = { CLIENT_ID: clientId, CLIENT_SECRET: clientSecret };
  writeFileSync(secretsPath, JSON.stringify(data, null, 2) + "\n");
  console.log("Wrote cloudflare entry to deployment.oauth.secrets.jsonc and Worker secrets.");
}

main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
