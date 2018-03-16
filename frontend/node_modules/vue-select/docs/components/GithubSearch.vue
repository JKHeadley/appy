<style lang="scss">
	.github-search {
		&.panel-default {
			border: none;
		}

		.panel-heading,
		.panel-footer {
			background: none;
		}

		.panel-heading {
			padding: 0;
			border: none;
		}

		.panel-body {
			display: flex;
			align-items: center;
			border-left: 1px solid #ddd;
			border-right: 1px solid #ddd;
		}

		.panel-footer {
			border: 1px solid #ddd;
		}

		p {
			margin-bottom: 0;
		}

		.v-select .dropdown-toggle {
			border-color: #ddd;
			border-bottom-left-radius: 0;
			border-bottom-right-radius: 0;
			padding: 5px;
		}

		.v-select .dropdown-toggle .open-indicator {
			top: 15px;
			right: 15px;
		}

		.v-select .selected-tag {
			background: none;
			border: none;
		}

		.gravatar {
			max-width: 25px;
			float: left;
			margin-right: 1em;
		}

		img {
			margin-bottom: 0;
		}

		.badge {
			background: #7BC8A4;
		}

		.list-inline {
			margin: 0;
		}
	}
</style>

<template>
	<div>
		<div class="github-search panel panel-default">
			<div class="panel-heading">
				<v-select :debounce="250" v-model="repo" :options="options" :on-search="getOptions" placeholder="Search GitHub Repositories..." label="full_name"></v-select>
			</div>
			<div class="panel-body" v-if="repo">
				<img :src="repo.owner.avatar_url" alt="{{ repo.owner.login }}" class="gravatar">
				<p>{{ repo.description }}</p>
			</div>
			<div class="panel-footer" v-if="repo">
				<ul class="list-inline" role="tablist">
					<li><a href="{{ repo.url }}">Stars <span class="badge">{{ repo.stargazers_count }}</span></a>
					</li>
					<li><a href="{{ repo.url }}">Forks <span class="badge">{{ repo.forks }}</span></a></li>
					<li><a href="{{ repo.url }}">Open Issues
						<span class="badge">{{ repo.open_issues_count }}</span></a></li>
				</ul>
			</div>
		</div>
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
