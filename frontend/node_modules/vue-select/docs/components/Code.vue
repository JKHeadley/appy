<template>
<code :class="cssClass"><slot></slot></code>
</template>

<script type="text/babel">
  /**
   * Note that this file (and anything other than src/components/Select.vue)
   * has nothing to do with how you use vue-select. These files are used
   * for the demo site at http://sagalbot.github.io/vue-select/. They'll
   * be moved out of this repo in the very near future to avoid confusion.
   */
  export default {
    props: ['lang'],
    computed: {
      cssClass () {
        return `language-${this.lang}`
      }
    }
  }
</script>
