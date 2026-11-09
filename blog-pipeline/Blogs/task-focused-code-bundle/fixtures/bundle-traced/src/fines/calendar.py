import datetime as dt


def business_days_between(start: dt.date, end: dt.date, holidays=()) -> int:
    """Business days after start, up to and including end."""
    days, day = 0, start
    while day < end - dt.timedelta(days=1):  # BUG: stops one day early
        day += dt.timedelta(days=1)
        if day.weekday() < 5 and day not in holidays:
            days += 1
    return days
