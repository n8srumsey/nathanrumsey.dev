import { UNDER_CONSTRUCTION } from '../src/config';

interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
}

export async function onRequest(context: {
  request: Request;
  next: () => Promise<Response>;
  env: Env;
}) {
  const { request, next, env } = context;

  if (!UNDER_CONSTRUCTION) return next();

  const { pathname } = new URL(request.url);
  if (pathname.startsWith('/under-construction')) return next();

  return env.ASSETS.fetch(new Request(new URL('/under-construction/', request.url), request));
}
