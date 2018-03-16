```html
<v-select
	:debounce="250"
	:on-search="getOptions"
	:options="options"
	placeholder="Search GitHub Repositories..."
	label="full_name"
>
</v-select>
```
```js
data() {
	return {
		options: null
	}
},
methods: {
  getOptions(search, loading) {
    loading(true)
    this.$http.get('https://api.github.com/search/repositories', {
       q: search
    }).then(resp => {
       this.options = resp.data.items
       loading(false)
    })
  }
}
```
