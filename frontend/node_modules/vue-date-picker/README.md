# vue-date-picker [![npm package](https://img.shields.io/npm/v/vue-date-picker.svg)](https://www.npmjs.com/package/vue-date-picker)

> datepicker component for Vue.js.

# screenshot

![screenshot](screenshot.png)

# Requirements

- [Vue.js](https://github.com/yyx990803/vue) `^1.0.0`

# Instllation

## npm 
``` bash
$ npm install vue-date-picker
```

# Usage
``` html
<template>
    <datepicker :readonly="true" format="YYYY-MM-DD"></datepicker>
    <datepicker format="YYYY-M-D" value="2015-9-5"></datepicker>
    <datepicker :readonly="true" format="MMM/D/YYYY" width="300px"></datepicker>
</template>

<script>
import datepicker from 'vue-date-picker';

export default {
    components: { datepicker }
};
</script>
```

# License

[The MIT License](http://opensource.org/licenses/MIT)