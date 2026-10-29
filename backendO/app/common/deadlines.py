"""Optional authenticated per-request budget; legacy callers keep their limits."""
from contextvars import ContextVar
from dataclasses import dataclass
from functools import wraps
import re
import time

from fastapi import HTTPException

HEADER = b"x-llmiser-deadline-ms"
FINALIZE_RESERVE_S = 10.0
MAX_BUDGET_S = 300.0
_current = ContextVar("processing_deadline", default=None)


class DeadlineExceeded(HTTPException):
    def __init__(self):
        super().__init__(504, "Conversion timed out. Try a smaller file or retry later.",
                         headers={"X-LLMiser-Deadline-Exceeded": "1"})


@dataclass(frozen=True)
class Budget:
    end: float

    def remaining(self):
        return max(0.0, self.end - time.monotonic())


class DeadlineMiddleware:
    """Set context before body parsing/thread admission; auth validates it later."""
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        value = None
        if scope["type"] == "http" and scope.get("path", "").startswith("/api/v1/internal/"):
            headers = [v for k, v in scope.get("headers", []) if k.lower() == HEADER]
            if headers:
                raw = headers[0]
                if len(headers) != 1 or not re.fullmatch(rb"[0-9]{1,16}", raw):
                    value = "invalid"
                else:
                    seconds = min(MAX_BUDGET_S, max(0.0, int(raw) / 1000 - time.time()))
                    value = Budget(time.monotonic() + seconds)
        token = _current.set(value)
        try:
            await self.app(scope, receive, send)
        finally:
            _current.reset(token)


def current_budget():
    value = _current.get()
    if value == "invalid":
        raise HTTPException(400, "Invalid processing deadline")
    return value


def check_budget(reserve=0.0):
    budget = current_budget()
    if budget is not None and budget.remaining() <= reserve:
        raise DeadlineExceeded()


def compute_checkpoint():
    check_budget(FINALIZE_RESERVE_S)


def timeout_seconds(default, *, reserve=0.0):
    budget = current_budget()
    if budget is None:
        return default
    left = budget.remaining() - reserve
    if left <= 0:
        raise DeadlineExceeded()
    return min(default, left)


def budgeted_worker(fn):
    """ThreadPoolExecutor does not inherit the request's ContextVar."""
    value = _current.get()
    @wraps(fn)
    def run(*args, **kwargs):
        token = _current.set(value)
        try:
            check_budget()
            return fn(*args, **kwargs)
        finally:
            _current.reset(token)
    return run
