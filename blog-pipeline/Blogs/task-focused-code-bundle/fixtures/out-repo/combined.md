# Repo

> **Source:** `repo.zip` (3.7 KB) · **Engine:** LLMiser Archive + MarkItDown

## `library-fines/docs/history.md`

# History

Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.
Notes from earlier releases.

## `library-fines/pyproject.toml`

```toml
[project]
name = "library-fines"
version = "0.2.0"
```

## `library-fines/src/fines/__init__.py`

```python

```

## `library-fines/src/fines/calendar.py`

```python
import datetime as dt


def business_days_between(start: dt.date, end: dt.date, holidays=()) -> int:
    """Business days after start, up to and including end."""
    days, day = 0, start
    while day < end - dt.timedelta(days=1):  # BUG: stops one day early
        day += dt.timedelta(days=1)
        if day.weekday() < 5 and day not in holidays:
            days += 1
    return days
```

## `library-fines/src/fines/config.py`

```python
RATE_PER_DAY = 0.25
HOLIDAYS = []
```

## `library-fines/src/fines/emailer.py`

```python
def reminder(email):
    return f"Reminder sent to {email}"
```

## `library-fines/src/fines/fines.py`

```python
from fines.calendar import business_days_between
from fines.config import HOLIDAYS, RATE_PER_DAY


def late_fee(due, returned):
    if returned <= due:
        return 0.0
    return round(business_days_between(due, returned, HOLIDAYS) * RATE_PER_DAY, 2)
```

## `library-fines/src/fines/report.py`

```python
def monthly_report(rows):
    return f"{len(rows)} fines this month"
```

## `library-fines/tests/test_fines.py`

```python
import datetime as dt

from fines.fines import late_fee


def test_friday_due_monday_return():
    # Due Friday 6 Nov 2026, returned Monday 9 Nov: one business day late.
    assert late_fee(dt.date(2026, 11, 6), dt.date(2026, 11, 9)) == 0.25
```

## `library-fines/tests/test_report.py`

```python
from fines.report import monthly_report


def test_report():
    assert monthly_report([1, 2]) == '2 fines this month'
```
