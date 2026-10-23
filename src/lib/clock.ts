// Single source of "now" for the service. It exists so tests can freeze time
// with setClock() and get deterministic timestamps.

let source: () => Date = () => new Date();

export function setClock(fn: () => Date): void {
  source = fn;
}

export function resetClock(): void {
  source = () => new Date();
}

export function nowUtc(): Date {
  return source();
}

export function nowIso(): string {
  return nowUtc().toISOString();
}
