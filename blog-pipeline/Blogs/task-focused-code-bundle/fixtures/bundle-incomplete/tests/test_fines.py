import datetime as dt

from fines.fines import late_fee


def test_friday_due_monday_return():
    # Due Friday 6 Nov 2026, returned Monday 9 Nov: one business day late.
    assert late_fee(dt.date(2026, 11, 6), dt.date(2026, 11, 9)) == 0.25
