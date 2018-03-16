<style lang="scss">
  @import 'assets/scss/_demo.scss';
  @import 'assets/scss/_cyan_theme.scss';
  @import 'assets/scss/_prism.scss';
  @import 'assets/scss/_octicons.scss';
</style>

<template>
  <div id="docs" class="container-fluid">
    <div class="col-md-2 col-md-offset-1">
      <ul class="nav nav-pills nav-stacked">
        <li><a href="#">Install &amp; Usage</a></li>
        <li><a href="#">Examples</a></li>
        <li><a href="#">Ajax</a></li>
        <li><a href="#">Parameters</a></li>
      </ul>
    </div>
    <div class="col-md-7">
      <article v-html="install"></article>
      <article v-html="vModel"></article>
      <article v-html="single"></article>
      <article v-html="reactive"></article>
      <article v-html="labels"></article>
      <article v-html="ajax"></article>
    </div>
  </div>
</template>

<script type="text/babel">

/**
 * Note that this file (and anything other than src/components/Select.vue)
 * has nothing to do with how you use vue-select. These files are used
 * for the demo site at http://sagalbot.github.io/vue-select/.
 */

// import Examples from './components/Examples.vue'
// import Params from './components/Params.vue'
// import Ajax from './components/snippets/Ajax.vue'

export default {
  // components: { Params, Examples, Ajax }
  data () {
    return {
      install: require('./md/Install.md'),
      vModel: require('./md/VModel.md'),
      single: require('./md/SingleMultiple.md'),
      reactive: require('./md/ReactiveOptions.md'),
      labels: require('./md/CustomLabels.md'),
      ajax: require('./md/Ajax.md'),
    }
  },
}
</script>
