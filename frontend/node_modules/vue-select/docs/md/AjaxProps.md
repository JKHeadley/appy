```js
/**
* Accept a callback function that will be run
* when the search text changes. The callback
* will be invoked with these parameters:

* @param {search}  String          Current search text
* @param {loading} Function(bool)  Toggle loading class
*/
onSearch: {
  type: Function,
  default: false
},

/**
* Milliseconds to wait before invoking this.onSearch().
* Used to prevent sending an AJAX request until input
* has completed.
*/
debounce: {
  type: Number,
  default: 0
}
```
