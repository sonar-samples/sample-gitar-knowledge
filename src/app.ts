import { createServer } from 'node:http';
import type { IncomingMessage, Server } from 'node:http';
import { sendError, wrapResponse } from './lib/http.ts';
import type { Res } from './lib/http.ts';
import { registerHealthRoutes } from './routes/health.ts';
import { registerOrderRoutes } from './routes/orders.ts';

export interface Ctx {
  req: IncomingMessage;
  params: Record<string, string>;
  body: unknown;
}

export type Handler = (ctx: Ctx, res: Res) => void | Promise<void>;

interface Route {
  method: string;
  pattern: RegExp;
  keys: string[];
  handler: Handler;
}

export class Router {
  routes: Route[] = [];

  add(method: string, path: string, handler: Handler): void {
    const keys: string[] = [];
    const source = path.replace(/:(\w+)/g, (_m, key: string) => {
      keys.push(key);
      return '([^/]+)';
    });
    this.routes.push({ method, pattern: new RegExp(`^${source}$`), keys, handler });
  }

  get(path: string, handler: Handler): void {
    this.add('GET', path, handler);
  }

  post(path: string, handler: Handler): void {
    this.add('POST', path, handler);
  }

  async dispatch(req: IncomingMessage, res: Res): Promise<void> {
    const path = (req.url ?? '/').split('?')[0];
    for (const route of this.routes) {
      const match = route.pattern.exec(path);
      if (!match || route.method !== req.method) continue;
      const params: Record<string, string> = {};
      route.keys.forEach((key, i) => {
        params[key] = decodeURIComponent(match[i + 1]);
      });
      let body: unknown;
      try {
        body = await readJson(req);
      } catch {
        return sendError(res, 400, 'invalid_json', 'Request body is not valid JSON');
      }
      return route.handler({ req, params, body }, res);
    }
    sendError(res, 404, 'not_found', `No route for ${req.method} ${path}`);
  }
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : undefined;
}

export function createApp(): Server {
  const router = new Router();
  registerHealthRoutes(router);
  registerOrderRoutes(router);
  return createServer((req, res) => {
    router.dispatch(req, wrapResponse(res)).catch(() => {
      sendError(wrapResponse(res), 500, 'internal_error', 'Unexpected error');
    });
  });
}
