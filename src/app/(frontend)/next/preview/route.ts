import config from "@payload-config";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") ?? "/";

  if (!path.startsWith("/")) {
    return new Response("Ongeldig pad", { status: 400 });
  }

  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: new Headers(req.headers) });
  if (!user) {
    return new Response("Log eerst in bij het CMS om previews te bekijken", { status: 403 });
  }

  const draft = await draftMode();
  draft.enable();
  redirect(path);
}
