# D Patch Kept

> **Source:** `d-patch-kept.zip` (2.0 KB) · **Engine:** LLMiser Archive + MarkItDown

## `shop/package-lock.json`

```json
{
  "name": "shop",
  "lockfileVersion": 3,
  "packages": {
    "node_modules/acme-money": {
      "version": "2.1.4",
      "resolved": "https://registry.example.com/acme-money-2.1.4.tgz"
    },
    "node_modules/jest": {
      "version": "29.7.0"
    }
  }
}
```

## `shop/package.json`

```json
{
  "name": "shop",
  "version": "1.4.0",
  "dependencies": {
    "acme-money": "^2.1.0"
  },
  "devDependencies": {
    "jest": "^29.7.0"
  }
}
```

## `shop/patches/acme-money/PATCH.md`

Patched from acme-money 2.1.4 to remove a logging call. Rounding unchanged.

## `shop/patches/acme-money/round.js`

```javascript
// Local patch of acme-money 2.1.4 (kept in vendor/ by this team)
// Uses toFixed, which works on binary floating point: 2.675 is stored as 2.67499999...
module.exports.round = (x, d) => Number(x.toFixed(d));
```

## `shop/README.md`

# shop

Question for review: why does total(2.675) return 2.67, not 2.68?
The rounding code is a patched copy of acme-money, kept under patches/ in this sharing copy (vendor/ in the working folder).

## `shop/src/invoice.js`

```javascript
const { round } = require('../vendor/acme-money/round');

function total(amount) {
  return round(amount, 2);
}

module.exports = { total };
```

## `shop/test/invoice.test.js`

```javascript
const { total } = require('../src/invoice');

test('rounds half up to cents', () => {
  expect(total(2.675)).toBe(2.68); // fails: returns 2.67
});
```
