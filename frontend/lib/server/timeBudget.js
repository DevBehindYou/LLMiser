// Per-route budgets, not a new lifetime limit on durable multi-stage jobs.
export const ROUTE_BUDGET_MS = 300_000;
export const FINALIZATION_RESERVE_MS = 60_000;
export const MIN_ATTEMPT_MS = 13_000; // backend save reserve + response margin + useful work
export const DEADLINE_HEADER = 'X-LLMiser-Deadline-Ms';
export const DEADLINE_EXCEEDED_HEADER = 'X-LLMiser-Deadline-Exceeded';
export const TIMEOUT_DETAIL = 'Conversion timed out. Try a smaller file or retry later.';

export class DeadlineExceededError extends Error {
  constructor() { super(TIMEOUT_DETAIL); this.name = 'DeadlineExceededError'; this.status = 504; }
}

export const routeDeadline = (now = Date.now()) => now + ROUTE_BUDGET_MS;

export function remainingMs(deadlineMs, now = Date.now()) {
  return Math.max(0, Math.floor(deadlineMs - now));
}

export function boundedTimeout(deadlineMs, ceilingMs, now = Date.now()) {
  const remaining = deadlineMs === undefined ? ceilingMs : remainingMs(deadlineMs, now);
  if (remaining < 1) throw new DeadlineExceededError();
  return Math.min(ceilingMs, remaining);
}
