# scope-eval

Eval a string with a passed scope

Example:
```javascript
scopeEval = require('scope-eval')

scopeEval("a + b + c", {
  a: 1,
  b: 2,
  c: 3
}) // Returns 6
```
