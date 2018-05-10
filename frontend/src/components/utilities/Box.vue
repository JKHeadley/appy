<template>
  <div class="box" ref="box" :class="classes">

    <div v-if="!disableHeader" class="box-header" :class="headerBorder ? 'with-border' : ''">
      <div class="box-tools">
        <slot name="box-tools"></slot>
        <button v-if="canCollapse && !collapsed" class="btn btn-box-tool" v-tooltip="'Collapse'" @click="collapse"><i class="fa fa-minus"></i></button>
        <button v-if="canCollapse && collapsed" class="btn btn-box-tool" v-tooltip="'Expand'" @click="expand"><i class="fa fa-plus"></i></button>
        <button v-if="canClose" class="btn btn-box-tool" v-tooltip="'Close'" @click="close"><i class="fa fa-times"></i></button>
      </div>

      <slot name="header"></slot>
    </div>

    <div v-if="!disableBody" class="box-body" ref="body" :class="[collapsed ? 'collapsed' : '', noPadding ? 'no-padding' : '']">
      <slot name="body"></slot>
    </div>

    <div v-if="!disableFooter" class="box-footer" ref="footer">
      <slot name="footer"></slot>
    </div>

    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: 'Box',
    props: ['disableHeader', 'disableBody', 'disableFooter', 'canCollapse', 'canClose', 'classes', 'noPadding', 'headerBorder'],
    data () {
      return {
        collapsed: false
      }
    },
    computed: {
    },
    watch: {
    },
    methods: {
      collapse () {
        this.collapsed = true
        $(this.$refs.body).slideToggle(500)
        $(this.$refs.footer).slideToggle(500)
      },
      expand () {
        this.collapsed = false
        $(this.$refs.body).slideToggle(500)
        $(this.$refs.footer).slideToggle(500)
      },
      close () {
        $(this.$refs.box).slideToggle(500)
      }
    },
    created () {
    },
    beforeDestroy () {
    }
  }
</script>

<style lang="scss">
</style>