# Invoice Tool Original

> **Source:** `invoice-tool-original.zip` (317.6 KB) · **Engine:** LLMiser Archive + MarkItDown

## `invoice-tool/.gitignore`

```
.env
.env.*
!.env.example
logs/
dist/
build/
.venv/
__pycache__/
.pytest_cache/
web/node_modules/
tmp/
```

## `invoice-tool/backup/invoice-tool-2026-09.zip/invoice-tool/config/settings.old.yaml`

```yaml
payments_api_key: FAKE-old-payments-key-NOT-REAL-9999
```

## `invoice-tool/backup/invoice-tool-2026-09.zip/invoice-tool/src/invoice/totals.py`

```python
# September copy
def invoice_total(lines):
    return sum(lines)
```

## `invoice-tool/config/app.yaml`

```yaml
currency: USD
rounding: half_up
locale: en_US
```

## `invoice-tool/config/settings.local.yaml`

```yaml
# Local override, renamed from .env during a debugging session
payments_api_key: FAKE-payments-key-NOT-REAL-0000
smtp_password: FAKE-smtp-password-NOT-REAL
```

## `invoice-tool/data/customers-export.csv`

| name | email | city |
| --- | --- | --- |
| Jordan Lee | jordan.lee@example.com | Springfield |
| Casey Morgan | casey.morgan@example.com | Riverton |

## `invoice-tool/logs/app-2026-11-02.log`

2026-11-02T09:14:03Z INFO  invoice sent to jordan.lee@example.com from 203.0.113.24
2026-11-02T09:15:41Z WARN  retry payment for account 4410 (casey.morgan@example.com)
2026-11-02T09:16:02Z ERROR rounding mismatch on invoice INV-1043: expected 0.02, got 0.03

## `invoice-tool/pyproject.toml`

```toml
[project]
name = "invoice-tool"
version = "0.3.0"
requires-python = ">=3.11"
dependencies = ["babel==2.16.0"]

[project.optional-dependencies]
test = ["pytest==8.3.3"]
```

## `invoice-tool/README.md`

# invoice-tool

Small CLI that totals invoice lines and prints a summary.

Run `python -m invoice.cli lines.csv`. Tests: `pytest`.

## `invoice-tool/requirements.lock`

```
babel==2.16.0
pytest==8.3.3
iniconfig==2.0.0
pluggy==1.5.0
packaging==24.1
```

## `invoice-tool/src/invoice/__init__.py`

```python
"""Invoice totals."""
```

## `invoice-tool/src/invoice/cli.py`

```python
import csv
import sys

from invoice.totals import invoice_total


def main(path: str) -> None:
    with open(path, newline="") as handle:
        lines = [(int(row["qty"]), row["unit_price"]) for row in csv.DictReader(handle)]
    print(f"Total: {invoice_total(lines)}")


if __name__ == "__main__":
    main(sys.argv[1])
```

## `invoice-tool/src/invoice/totals (copy).py`

```python
from decimal import Decimal, ROUND_HALF_UP


def line_total(quantity: int, unit_price: str) -> Decimal:
    """Price of one invoice line, rounded to cents."""
    return (Decimal(unit_price) * quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def invoice_total(lines: list[tuple[int, str]]) -> Decimal:
    # BUG under review: rounds each line, then sums. Finance wants the sum rounded once.
    return sum((line_total(q, p) for q, p in lines), Decimal("0"))
```

## `invoice-tool/src/invoice/totals.py`

```python
from decimal import Decimal, ROUND_HALF_UP


def line_total(quantity: int, unit_price: str) -> Decimal:
    """Price of one invoice line, rounded to cents."""
    return (Decimal(unit_price) * quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def invoice_total(lines: list[tuple[int, str]]) -> Decimal:
    # BUG under review: rounds each line, then sums. Finance wants the sum rounded once.
    return sum((line_total(q, p) for q, p in lines), Decimal("0"))
```

## `invoice-tool/src/invoice/totals_old.py`

```python
# Obsolete version kept 'just in case'
def invoice_total(lines):
    return round(sum(q * float(p) for q, p in lines), 2)
```

## `invoice-tool/tests/test_totals.py`

```python
from decimal import Decimal

from invoice.totals import invoice_total


def test_round_once_not_per_line():
    # Three lines of 0.005: rounded once the total is 0.015 -> 0.02.
    # Rounding each line first gives 0.01 + 0.01 + 0.01 = 0.03.
    assert invoice_total([(1, "0.005")] * 3) == Decimal("0.02")
```

## `invoice-tool/tmp/debug-notes.txt`

Scratch notes 2026-11-02
Tried the payments sandbox with FAKE-payments-key-NOT-REAL-0000
Customer on the call: casey.morgan@example.com

## `invoice-tool/web/package-lock.json`

```json
{
  "name": "invoice-web",
  "lockfileVersion": 3,
  "packages": {
    "node_modules/left-pad": { "version": "1.3.0" }
  }
}
```

## `invoice-tool/web/package.json`

```json
{
  "name": "invoice-web",
  "version": "0.3.0",
  "dependencies": { "left-pad": "1.3.0" }
}
```

## `invoice-tool/web/src/app.js`

```javascript
import leftPad from 'left-pad';
export const label = (n) => leftPad(String(n), 8);
```
