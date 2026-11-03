import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createProfileMcpServer } from "@/lib/mcp/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CORS_ORIGIN = { "Access-Control-Allow-Origin": "*" };

function withHeaders(response: Response, headers: Record<string, string>): Response {
  const merged = new Response(response.body, response);
  for (const [name, value] of Object.entries(headers)) merged.headers.set(name, value);
  return merged;
}

function internalError(): Response {
  return Response.json(
    { jsonrpc: "2.0", error: { code: -32603, message: "Internal error" }, id: null },
    { status: 500, headers: { ...CORS_ORIGIN, "Cache-Control": "no-store" } }
  );
}

/** Stateless: every request gets its own server and transport, and replies with plain JSON. */
export async function POST(request: Request): Promise<Response> {
  const server = createProfileMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });
  try {
    await server.connect(transport);
    const response = await transport.handleRequest(request);
    return withHeaders(response, { ...CORS_ORIGIN, "Cache-Control": "no-store" });
  } catch (error) {
    console.error("mcp error", error instanceof Error ? error.name : "unknown");
    return internalError();
  } finally {
    await transport.close().catch(() => {});
    await server.close().catch(() => {});
  }
}

function methodNotAllowed(): Response {
  return Response.json(
    { jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed." }, id: null },
    { status: 405, headers: { ...CORS_ORIGIN, Allow: "POST, OPTIONS", "Cache-Control": "no-store" } }
  );
}

export const GET = methodNotAllowed;
export const DELETE = methodNotAllowed;

export function OPTIONS(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      ...CORS_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version",
      "Access-Control-Max-Age": "86400"
    }
  });
}
