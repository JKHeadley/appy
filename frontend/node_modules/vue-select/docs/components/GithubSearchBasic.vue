<template>
	<div>
		<p><v-select :debounce="250" :options="options" :on-search="getOptions" placeholder="Search GitHub Repositories..." label="full_name"></v-select></p>

		<div v-if="error" class="alert alert-warning" role="alert">
			<button type="button" class="close" @click="error = null">
				<span aria-hidden="true">&times;</span></button>
				{{ error.message }}
		</div>
	</div>
</template>

<script type="text/babel">
	export default {
		data() {
			return {
				repo: null,
				error: null,
				options: null
			}
		},

		methods: {
			getOptions(search, loading) {
				loading(true)
				this.$http.get('https://api.github.com/search/repositories', {q: search})
								.then(resp => {
									this.options = resp.data.items
									loading(false)
								})
								.catch(err => {
									this.error = err.data
									loading(false)
								})
			}
		}
	}
</script>