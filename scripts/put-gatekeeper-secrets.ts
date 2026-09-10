/**
 * Install CLIENT_ID / CLIENT_SECRET on every OAuth Gatekeeper Worker.
 *
 * Reads `deployment.oauth.secrets.jsonc` (gitignored). Copy from
 * `deployment.oauth.secrets.example.jsonc` and fill in values from each provider console.
 *
 * Usage: node scripts/put-gatekeeper-secrets.ts
 */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, type ParseError } from "jsonc-parser";
import { pnpmCommand } from "../cloudflare-os/scripts/pnpm-command.ts";
import { resolveBinEntry } from "../cloudflare-os/scripts/bin-entry.ts";
import { oauthGatekeepers } from "./extra-gatekeepers.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const secretsPath = join(root, "deployment.oauth.secrets.jsonc");
const deploymentPath = join(root, "deployment.jsonc");

type SecretsFile = Record<string, { CLIENT_ID?: string; CLIENT_SECRET?: string }>;

async function readJsonc<T>(path: string): Promise<T> {
  const errors: ParseError[] = [];
  const result = parse(await readFile(path, "utf8"), errors, { allowTrailingComma: true }) as T;
  if (errors.length) throw new Error(`${path}: JSONC parse error`);
  return result;
}

function putSecret(workerName: string, name: string, value: string, accountId: string): void {
  const cwd = root;
  const env = {
    ...process.env,
    CLOUDFLARE_ACCOUNT_ID: accountId,
    // Prefer Wrangler OAuth over a stale CF_API_TOKEN.
    CF_API_TOKEN: "",
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN ?? "",
  };
  const entry = resolveBinEntry(cwd, "wrangler");
  const input = Buffer.from(value, "utf8");
  if (entry) {
    const result = spawnSync(process.execPath, [entry, "secret", "put", name, "--name", workerName], {
      cwd,
      env,
      input,
      stdio: ["pipe", "inherit", "inherit"],
    });
    if (result.status !== 0) {
      throw new Error(`wrangler secret put ${name} --name ${workerName} failed`);
    }
    return;
  }
  const [command, argv] = pnpmCommand(
    ["exec", "wrangler", "secret", "put", name, "--name", workerName],
    env,
  );
  const result = spawnSync(command, argv, {
    cwd,
    env,
    input,
    stdio: ["pipe", "inherit", "inherit"],
  });
  if (result.status !== 0) {
    throw new Error(`wrangler secret put ${name} --name ${workerName} failed`);
  }
}

async function main(): Promise<void> {
  if (!existsSync(secretsPath)) {
    throw new Error(
      `Missing ${secretsPath}. Copy deployment.oauth.secrets.example.jsonc and fill CLIENT_ID / ` +
      "CLIENT_SECRET for every OAuth Gatekeeper.");
  }

  const deployment = await readJsonc<{
    accountId: string;
    workers: Record<string, { name?: string }>;
  }>(deploymentPath);
  const secrets = await readJsonc<SecretsFile>(secretsPath);

  const missing: string[] = [];
  for (const spec of oauthGatekeepers()) {
    const workerName = deployment.workers[spec.key]?.name;
    if (!workerName) {
      missing.push(`workers.${spec.key}.name in deployment.jsonc`);
      continue;
    }
    const pair = secrets[spec.key];
    if (!pair?.CLIENT_ID?.trim() || !pair?.CLIENT_SECRET?.trim()) {
      missing.push(`${spec.key} (CLIENT_ID + CLIENT_SECRET in deployment.oauth.secrets.jsonc)`);
      continue;
    }
    if (pair.CLIENT_ID.includes("<") || pair.CLIENT_SECRET.includes("<")) {
      missing.push(`${spec.key} (replace placeholders)`);
    }
  }
  if (missing.length) {
    throw new Error(`OAuth secrets incomplete:\n  - ${missing.join("\n  - ")}`);
  }

  for (const spec of oauthGatekeepers()) {
    const workerName = deployment.workers[spec.key]!.name!;
    const pair = secrets[spec.key]!;
    console.log(`Setting secrets on ${workerName} (${spec.shortName})…`);
    putSecret(workerName, "CLIENT_ID", pair.CLIENT_ID!.trim(), deployment.accountId);
    putSecret(workerName, "CLIENT_SECRET", pair.CLIENT_SECRET!.trim(), deployment.accountId);
  }
  console.log("\nAll OAuth Gatekeeper CLIENT_ID / CLIENT_SECRET secrets installed.");
}

try {
  await main();
} catch (error) {
  console.error(`\n${(error as Error).message}`);
  process.exitCode = 1;
}
