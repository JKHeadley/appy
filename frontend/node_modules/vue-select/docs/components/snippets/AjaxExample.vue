<template>
	<pre><v-code lang="markup">&lt;v-select
	:debounce=&quot;250&quot;
	:on-search=&quot;getOptions&quot;
	:options=&quot;options&quot;
	placeholder=&quot;Search GitHub Repositories...&quot;
	label=&quot;full_name&quot;
&gt;
&lt;/v-select&gt;</v-code></pre>
				<pre><v-code lang="javascript">data() {
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
</v-code></pre>
</template>

<script type="text/babel">
	export default {}
</script>