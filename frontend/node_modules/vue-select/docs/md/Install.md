## NPM Based WorkFlows
``` bash
$ npm install vue-select
```

```html
<template>
   <div id="myApp">
      <v-select v-model="selected" :options="options"></v-select>
   </div>
</template>

<script>
import vSelect from 'vue-select'
export default {
  components: {vSelect},
  data() {
     return {
        selected: null,
        options: ['foo','bar','baz']
     }
  }
}
</script>
```

## Browser Globals

`v1.3.0+` no longer requires any toolchain to use the component:

Just include `vue` & `vue-select.js` - I recommend using [unpkg.com](https://unpkg.com/#/).

```html
<!-- use the latest release -->
<script src="https://unpkg.com/vue-select@latest"></script>
<!-- or point to a specific release -->
<script src="https://unpkg.com/vue-select@1.30"></script>
```
Then register the component in your javascript:

```js
Vue.component('v-select', VueSelect.VueSelect);
```

From there you can use as normal. Here's an [example on JSBin](http://jsbin.com/saxaru/5/edit?html,js,output).
