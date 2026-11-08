# Invoice Tool Sharing

> **Source:** `invoice-tool-sharing.zip` (3.2 KB) · **Engine:** LLMiser Archive + MarkItDown

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

## `invoice-tool/config/app.yaml`

```yaml
currency: USD
rounding: half_up
locale: en_US
```

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

## `invoice-tool/tests/test_totals.py`

```python
from decimal import Decimal

from invoice.totals import invoice_total


def test_round_once_not_per_line():
    # Three lines of 0.005: rounded once the total is 0.015 -> 0.02.
    # Rounding each line first gives 0.01 + 0.01 + 0.01 = 0.03.
    assert invoice_total([(1, "0.005")] * 3) == Decimal("0.02")
```

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
