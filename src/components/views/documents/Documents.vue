<template>
  <section class="content">
    <div>

      <div class="box box-primary box-solid">
        <div class="box-header">
          <h3 class="box-title">Documents</h3>
          <div class="box-tools">
            <button class="btn btn-box-tool" data-widget="collapse" data-toggle="tooltip" title="Collapse"><i class="fa fa-minus"></i></button>
          </div>
        </div>
        <div class="box-body">
          <div :class="addButtonClass">
            <router-link :to="{ name: 'DocumentCreate' }">
              <button class="btn btn-primary">Add Document</button>
            </router-link>
          </div>

          <v-server-table ref="documentTable" url="" :columns="columns" :options="options" v-on:row-click="rowClick" @loaded="onLoaded">
          </v-server-table>
        </div>

        <div v-if="loading" class="overlay">
          <i class="fa"><pulse-loader></pulse-loader></i>
        </div>
      </div>
    </div>

  </section>
</template>

<script>

  export default {
    name: 'Documents',
    data () {
      return {
        loading: null,
        documentTable: null,
        columns: ['title'],
        options: {
          highlightMatches: true,
          sortable: ['title'],
          requestFunction: (request) => {
            const params = {}
            params.$page = request.page
            params.$limit = request.limit
            if (request.orderBy) {
              params.$sort = request.ascending ? '-' + request.orderBy : request.orderBy
            }
            if (request.query) {
              params.$term = request.query
            }
            this.loading = true
            return this.$documentRepository.list(params)
              .catch((error) => {
                console.error('Documents.requestFunction-error:', error)
                this.$snotify.error('Get documents failed', 'Error!')
              })
          },
          responseAdapter: (response) => {
            this.loading = false
            return { data: response.data.docs, count: response.data.items.total }
          },
          uniqueKey: '_id'
        }
      }
    },
    computed: {
      addButtonClass () {
        if (this.documentTable) {
          return this.documentTable.count > this.documentTable.limit ? 'shift-add-left' : 'add-document'
        } else {
          return 'add-document'
        }
      }
    },
    methods: {
      rowClick (data) {
        this.$router.push({ name: 'DocumentDetails', params: { _id: data.row._id }, props: data.row })
      },
      onLoaded () {
        this.documentTable = this.$refs.documentTable
      }
    }
  }
</script>

<style lang="scss">
  .shift-add-left {
    position: absolute;
    right: 130px;
  }
  .add-document {
    position: absolute;
    right: 10px;
  }
</style>
