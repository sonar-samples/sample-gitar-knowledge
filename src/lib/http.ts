import type { ServerResponse } from 'node:http';

// Thin Express-style wrapper around ServerResponse, created by the router.
export interface Res {
  raw: ServerResponse;
  status(code: number): Res;
  json(body: unknown): void;
}

export function wrapResponse(raw: ServerResponse): Res {
  let code = 200;
  const res: Res = {
    raw,
    status(c: number) {
      code = c;
      return res;
    },
    json(body: unknown) {
      const payload = JSON.stringify(body);
      raw.writeHead(code, {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(payload),
      });
      raw.end(payload);
    },
  };
  return res;
}

export function sendError(res: Res, status: number, code: string, message: string): void {
  res.status(status).json({ error: { code, message } });
}
