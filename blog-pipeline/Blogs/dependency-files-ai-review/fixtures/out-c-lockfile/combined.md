# C Lockfile

> **Source:** `c-lockfile.zip` (1.2 KB) · **Engine:** LLMiser Archive + MarkItDown

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
