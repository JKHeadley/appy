<template>
	<article class="example" id="ex-ajax">
		<h3 id="ajax" class="page-header">AJAX Remote Option Loading</h3>
		<div class="row">
			<div class="col-md-6">
				<p>
					The <code>onSearch</code> prop allows you to load options via ajax in a parent component
					when the search text is updated. It is invoked with two parameters, <code>search</code> &amp; <code>loading</code>.
				</p>

				<h4>onSearch Callback Parameters <small>search, loading</small></h4>
				<p>
					<code>search</code> is a string containing the current search text.
					<code>loading</code> is a function that accepts a boolean value,
					and is used to toggle the 'loading' class on the top-level vue-select wrapper.
				</p>

				<h4>Loading Spinner</h4>
				<p>
					Vue Select includes a default loading spinner that appears when the loading class is present.
					The <code>spinner</code> slot allows you to implement your own spinner.


				</p>

					<div id="spinner-example" :class="{loading:spinner}">
						<button class="btn btn-sm btn-default" @click="spinner = !spinner">Toggle Spinner</button>
						<div class="spinner" v-show="spinner">Loading...</div>
					</div>


				<h4>Debounce Input</h4>
				<p>
					Vue Select also accepts a <code>debounce</code> prop that can be used to prevent
					<code>onSearch</code> from being called until input has completed.
				</p>

				<h4>Library Agnostic</h4>
				<p>
					Since Vue.js does not ship with ajax functionality as part of the core library,
					it's up to you to process the ajax requests in your parent component.
				</p>
			</div>
			<div class="col-md-6">
				<h4>Example <small>GitHub API</small></h4>
				<p>In this example,
					<a href="https://github.com/vuejs/vue-resource">Vue Resource</a> is used to access the
					<a href="https://developer.github.com/v3/">GitHub API</a>.
				</p>

				<git-hub-search-basic></git-hub-search-basic>
				<ajax-example></ajax-example>
			</div>
		</div>

		<div class="row">
			<div class="col-md-6">

			</div>

			</div>

		</div>
	</article>
</template>

<style>
	#spinner-example {
		max-width: 10em;
		display: block;
	}
	#spinner-example .spinner {
		display: none;
		display: inline-block;
		float: right;
		opacity: 0;
		font-size: 5px;
		text-indent: -9999em;
		border-top: .9em solid rgba(100,100,100,.1);
		border-right: .9em solid rgba(100,100,100,.1);
		border-bottom: .9em solid rgba(100,100,100,.1);
		border-left: .9em solid rgba(60,60,60,.45);
		transform: translateZ(0);
		animation: vSelectSpinner 1.1s infinite linear;
		transition: opacity .1s;
	}
	#spinner-example.loading .spinner {
		opacity: 1;
		display: block;
	}
	#spinner-example .spinner,
	#spinner-example .spinner:after {
		border-radius: 50%;
		width: 5em;
		height: 5em;
	}
	@-webkit-keyframes vSelectSpinner {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
	@keyframes vSelectSpinner {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>

<script type="text/babel">

	// import GitHubSearchBasic from 'docs/components/GitHubSearchBasic.vue'
	// import GitHubSearch from 'docs/components/GitHubSearch.vue'
	// import AjaxProps from './AjaxProps.vue'
	// import AjaxExample from './AjaxExample.vue'

	export default {
		// components: {GitHubSearchBasic, GitHubSearch, AjaxProps, AjaxExample},
		data() {
			return {
				basicSource: false,
				spinner: false
			}
		}
	}
</script>
