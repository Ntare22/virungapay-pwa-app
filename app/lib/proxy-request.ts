import { NextRequest, NextResponse } from "next/server";

const apiURL = process.env.API_URL ?? "http://localhost:8080";

export async function proxyRequest(request: NextRequest, prefix: string, path: string[]) {
  const target = `${apiURL}/${prefix}/${path.join("/")}${request.nextUrl.search}`;
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const accept = request.headers.get("accept");
  if (accept) headers.set("accept", accept);
  const authorization = request.headers.get("authorization");
  if (authorization) headers.set("authorization", authorization);

  let response: Response;
  try {
    response = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
    });
  } catch {
    return NextResponse.json(
      { error: { code: "unavailable", message: "Could not reach VirungaPay. Check that the API is running." } },
      { status: 503 },
    );
  }

  const body = await response.arrayBuffer();
  return new NextResponse(body, {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
  });
}
