import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import config from "@payload-config";
import { getPayload } from "payload";

/**
 * Valideert het Bearer-token van een MCP-client (bv. Lottie/Hermes) tegen de
 * Payload-API-key van een gebruiker. Hermes' native MCP-client stuurt
 * `Authorization: Bearer <key>`; Payload verwacht `users API-Key <key>`, dus we
 * bouwen die header en laten Payload zelf de sleutel verifiëren.
 *
 * Bij succes reist het volledige user-document mee in `extra.user`, zodat de
 * tools als díé gebruiker kunnen handelen (attributie op de tijdlijn).
 */
export async function verifyMcpToken(
  _req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined;

  const payload = await getPayload({ config });
  const headers = new Headers();
  headers.set("Authorization", `users API-Key ${bearerToken}`);

  const { user } = await payload.auth({ headers });
  if (!user || user.collection !== "users") return undefined;

  return {
    token: bearerToken,
    clientId: user.email ?? String(user.id),
    scopes: ["wiki"],
    extra: { user },
  };
}
