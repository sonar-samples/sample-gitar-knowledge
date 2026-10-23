import type { Router } from '../app.ts';
import { nowIso } from '../lib/clock.ts';

export function registerHealthRoutes(router: Router): void {
  router.get('/health', (_ctx, res) => {
    res.json({ status: 'ok', time: nowIso() });
  });
}
