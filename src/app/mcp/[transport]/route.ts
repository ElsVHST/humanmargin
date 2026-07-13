import { createMcpHandler, withMcpAuth } from "mcp-handler";

import { registerWikiTools } from "@/modules/knowledge/wiki/mcp/registerWikiTools";
import { verifyMcpToken } from "@/modules/knowledge/wiki/mcp/verifyToken";

// Payload's Local API vereist de Node.js-runtime (geen edge).
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * MCP-server van het Human Margin-dashboard, aangesproken door Lottie (Hermes)
 * via streamable HTTP op `/mcp/mcp`. Bewust NIET onder `/api` gemount, zodat het
 * niet botst met Payloads `/api/[...slug]`-catch-all.
 *
 * Increment 1: de wiki-toolset. Dashboard-tools (deals/taken lezen + veilige
 * creates) volgen in increment 2.
 */
const handler = createMcpHandler(
  (server) => {
    registerWikiTools(server);
  },
  {
    serverInfo: { name: "human-margin-dashboard", version: "0.1.0" },
    capabilities: { tools: {} },
  },
  { basePath: "/mcp", maxDuration: 60 },
);

const authHandler = withMcpAuth(handler, verifyMcpToken, { required: true });

export { authHandler as GET, authHandler as POST };
