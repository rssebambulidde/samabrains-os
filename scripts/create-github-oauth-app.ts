/**
 * Create a GitHub OAuth App for Samabrains OS via the GitHub API (manifest flow).
 * Requires `gh` auth with sufficient scopes; falls back with instructions if blocked.
 *
 * Usage: node scripts/create-github-oauth-app.ts
 */
import { spawnSync } from "node:child_process";

const HOMEPAGE = "https://os.samabrains.com";
const CALLBACK = "https://os.samabrains.com/gatekeeper/github/oauth";

function gh(args: string[]): { status: number; stdout: string; stderr: string } {
  const r = spawnSync("gh", args, { encoding: "utf8" });
  return {
    status: r.status ?? 1,
    stdout: r.stdout ?? "",
    stderr: r.stderr ?? "",
  };
}

async function main() {
  // GitHub does not expose a simple "create OAuth App" REST endpoint for users.
  // Use the App Manifest conversion URL instructions, then print next steps.
  const status = gh(["auth", "status"]);
  if (status.status !== 0) {
    throw new Error("gh is not authenticated. Run: gh auth login");
  }

  console.log(`Create a GitHub OAuth App (not a GitHub App):
  1. Open https://github.com/settings/developers → OAuth Apps → New OAuth App
  2. Application name: Samabrains OS
  3. Homepage URL: ${HOMEPAGE}
  4. Authorization callback URL: ${CALLBACK}
  5. Register → Generate a new client secret
  6. Put values in deployment.oauth.secrets.jsonc under "github"
`);

  // If an existing OAuth app is already registered, list via browser/manual.
  // Attempt org-level listing is not available for personal OAuth apps via API.
  process.exitCode = 0;
}

main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
