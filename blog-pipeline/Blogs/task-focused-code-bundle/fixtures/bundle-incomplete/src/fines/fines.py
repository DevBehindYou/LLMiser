from fines.calendar import business_days_between
from fines.config import HOLIDAYS, RATE_PER_DAY


def late_fee(due, returned):
    if returned <= due:
        return 0.0
    return round(business_days_between(due, returned, HOLIDAYS) * RATE_PER_DAY, 2)
