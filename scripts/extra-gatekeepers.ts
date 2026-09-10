/**
 * Third-party / optional Gatekeepers from the Cloudflare OS release that the starter
 * deploys alongside Context, Scheduler, and the custom Gatekeeper.
 *
 * Binding name: GATEKEEPER_<SHORT_UPPER_WITH_UNDERSCORES>
 * Router path: /gatekeeper/<shortName>
 */

export interface ExtraGatekeeperSpec {
  /** Key under `workers` in deployment.jsonc. */
  key: string;
  /** Path segment after `/gatekeeper/`. */
  shortName: string;
  /** Package directory relative to the repository root. */
  dir: string;
  /** Vite+/pnpm package name for `vp run -F`. */
  packageName: string;
  /** Requires Wrangler secrets CLIENT_ID + CLIENT_SECRET. */
  oauth: boolean;
}

/** Full Cloudflare OS Gatekeeper inventory minus Context/Scheduler (already core). */
export const EXTRA_GATEKEEPERS: readonly ExtraGatekeeperSpec[] = [
  {
    key: "github",
    shortName: "github",
    dir: "cloudflare-os/packages/gatekeeper-github",
    packageName: "@gadgets/github-gatekeeper",
    oauth: true,
  },
  {
    key: "google",
    shortName: "google",
    dir: "cloudflare-os/packages/gatekeeper-google",
    packageName: "@gadgets/google-gatekeeper",
    oauth: true,
  },
  {
    key: "notion",
    shortName: "notion",
    dir: "cloudflare-os/packages/gatekeeper-notion",
    packageName: "@gadgets/notion-gatekeeper",
    oauth: true,
  },
  {
    key: "slack",
    shortName: "slack",
    dir: "cloudflare-os/packages/gatekeeper-slack",
    packageName: "@gadgets/slack-gatekeeper",
    oauth: true,
  },
  {
    key: "cloudflare",
    shortName: "cloudflare",
    dir: "cloudflare-os/packages/gatekeeper-cloudflare",
    packageName: "@gadgets/cloudflare-gatekeeper",
    oauth: true,
  },
  {
    key: "confluence",
    shortName: "confluence",
    dir: "cloudflare-os/packages/gatekeeper-confluence",
    packageName: "@gadgets/confluence-gatekeeper",
    oauth: true,
  },
  {
    key: "linear",
    shortName: "linear",
    dir: "cloudflare-os/packages/gatekeeper-linear",
    packageName: "@gadgets/linear-gatekeeper",
    oauth: true,
  },
  {
    key: "spotify",
    shortName: "spotify",
    dir: "cloudflare-os/packages/gatekeeper-spotify",
    packageName: "@gadgets/spotify-gatekeeper",
    oauth: true,
  },
  {
    key: "supabase",
    shortName: "supabase",
    dir: "cloudflare-os/packages/gatekeeper-supabase",
    packageName: "@gadgets/supabase-gatekeeper",
    oauth: true,
  },
  {
    key: "homeassistant",
    shortName: "homeassistant",
    dir: "cloudflare-os/packages/gatekeeper-homeassistant",
    packageName: "@gadgets/homeassistant-gatekeeper",
    oauth: false,
  },
  {
    key: "mcp",
    shortName: "mcp",
    dir: "cloudflare-os/packages/gatekeeper-mcp",
    packageName: "@gadgets/mcp-gatekeeper",
    oauth: false,
  },
  {
    key: "mcpPortal",
    shortName: "mcp-portal",
    dir: "cloudflare-os/packages/gatekeeper-mcp-portal",
    packageName: "@gadgets/mcp-portal-gatekeeper",
    oauth: false,
  },
  {
    key: "email",
    shortName: "email",
    dir: "cloudflare-os/packages/gatekeeper-email",
    packageName: "@gadgets/email-gatekeeper",
    oauth: false,
  },
] as const;

export function gatekeeperBindingName(shortName: string): string {
  return `GATEKEEPER_${shortName.toUpperCase().replaceAll("-", "_")}`;
}

export function oauthGatekeepers(): ExtraGatekeeperSpec[] {
  return EXTRA_GATEKEEPERS.filter((g) => g.oauth);
}
