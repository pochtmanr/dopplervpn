import { productionDeps } from "./production";
import { handleBusinessOs } from "./handler";

export async function GET(request: Request): Promise<Response> {
  try {
    return await handleBusinessOs(request, productionDeps());
  } catch {
    return Response.json(
      {
        error: {
          code: "temporary_unavailable",
          message: "The export is temporarily unavailable.",
          retryable: true,
        },
      },
      { status: 503, headers: { "cache-control": "private, no-store" } },
    );
  }
}
