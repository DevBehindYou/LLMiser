from fines.report import monthly_report


def test_report():
    assert monthly_report([1, 2]) == '2 fines this month'
