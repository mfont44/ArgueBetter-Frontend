const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ProxyContext = {
  params: Promise<{
    path: string[];
  }>;
};

async function proxyRequest(request: Request, { params }: ProxyContext) {
  const { path } = await params;
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`/${path.join("/")}`, BACKEND_URL);
  targetUrl.search = incomingUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
    cache: "no-store",
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export function GET(request: Request, context: ProxyContext) {
  return proxyRequest(request, context);
}

export function POST(request: Request, context: ProxyContext) {
  return proxyRequest(request, context);
}

export function PUT(request: Request, context: ProxyContext) {
  return proxyRequest(request, context);
}

export function PATCH(request: Request, context: ProxyContext) {
  return proxyRequest(request, context);
}

export function DELETE(request: Request, context: ProxyContext) {
  return proxyRequest(request, context);
}
