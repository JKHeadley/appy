<template>

  <textarea class="form-control" id="editor" style="height:300px;"></textarea>

</template>

<script>
  import { eventBus } from '../../services'
  import { EVENTS } from '../../config'

  export default {
    props: ['body', 'canEdit'],
    data () {
      return {
        editor: null
      }
    },
    watch: {
      body (val) {
        this.editor.setData(val)
      }
    },
    methods: {
      sendData () {
        const data = this.editor.getData()
        eventBus.$emit(EVENTS.DATA_READY, data)
      },
      clearData () {
        this.editor.setData('')
      }
    },
    mounted () {
      ClassicEditor
        .create(document.querySelector('#editor'))
        .then((editor) => {
          this.editor = editor
//          console.log("PLUGINS:")
//          ClassicEditor.build.plugins.map((plugin) => console.log(plugin.pluginName))
//
//          console.log("TOOLS:")
//          console.log(Array.from( editor.ui.componentFactory.names() ))

          if (this.body) {
            editor.setData(this.body)
          }
          if (!this.canEdit) {
            editor.isReadOnly = true
          }
        })
        .catch((error) => {
          console.error(error)
        })

      eventBus.$on(EVENTS.DATA_REQUESTED, this.sendData)
      eventBus.$on(EVENTS.CLEAR_REQUESTED, this.clearData)
    },
    beforeDestroy () {
      eventBus.$off(EVENTS.DATA_REQUESTED, this.sendData)
      eventBus.$off(EVENTS.CLEAR_REQUESTED, this.clearData)
      this.editor.destroy()
        .catch((error) => {
          console.log(error)
        })
    }
  }
</script>

<style lang="scss">
  div[role=textbox] {
    height: 300px;
  }
</style>