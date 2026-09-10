import calendar
from datetime import date


def add_months(source_date, months):
    month_index = source_date.month - 1 + months
    year = source_date.year + month_index // 12
    month = month_index % 12 + 1
    day = min(source_date.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def compute_expiry(course, from_date):
    if not course.certificate_validity_months:
        return None
    return add_months(from_date, course.certificate_validity_months)
