<template>
  <!-- Content Header (Page header) -->
  <section class="content-header">
    <h1>
      {{ $route.meta.title }}
      <small>{{ $route.meta.description }}</small>
    </h1>
    <ol class="breadcrumb breadcrumb-below">
      <li>
          <router-link to="/"><i class="fa fa-home"></i>Home</router-link>
      </li>
      <li v-for="(breadcrumb, index) in breadcrumbs" :class="isActive(index)">
        <router-link :to="breadcrumb.path">{{ breadcrumb.title }}</router-link>
      </li>
    </ol>
  </section>
</template>

<script>
  export default {
    name: 'ContentHeader',
    computed: {
      breadcrumbs () {
        return this.$store.state.breadcrumbs
      }
    },
    methods: {
      isActive (index) {
        if (index === this.breadcrumbs.length - 1) {
          return 'active'
        } else {
          return 'not-active'
        }
      }
    }
  }
</script>

<style lang="scss">
  .not-active {
    cursor: pointer;
  }
  .active {
    cursor: default;
    font-weight: bold;
  }
</style>