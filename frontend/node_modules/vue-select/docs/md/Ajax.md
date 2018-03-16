## AJAX Remote Option Loading


The `onSearch` prop allows you to load options via ajax in a parent component when the search text is updated. It is invoked with two parameters, `search` & `loading`.

#### onSearch Callback Parameters <small>search, loading</small>

`search` is a string containing the current search text. `loading` is a function that accepts a boolean value, and is used to toggle the 'loading' class on the top-level vue-select wrapper.

#### Loading Spinner

Vue Select includes a default loading spinner that appears when the loading class is present. The `spinner` slot allows you to implement your own spinner.

<div id="spinner-example" :class="{loading:spinner}"><button class="btn btn-sm btn-default" @click="spinner = !spinner">Toggle Spinner</button>

<div class="spinner" v-show="spinner">Loading...</div>

#### Debounce Input

Vue Select also accepts a `debounce` prop that can be used to prevent `onSearch` from being called until input has completed.

#### Library Agnostic

Since Vue.js does not ship with ajax functionality as part of the core library, it's up to you to process the ajax requests in your parent component.


#### Example <small>GitHub API</small>

In this example, [Vue Resource](https://github.com/vuejs/vue-resource) is used to access the [GitHub API](https://developer.github.com/v3/).

<git-hub-search-basic></git-hub-search-basic><ajax-example></ajax-example></div>
