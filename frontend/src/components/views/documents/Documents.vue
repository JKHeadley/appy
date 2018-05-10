<template>
  <section class="content">
    <div>
      <box :classes="['box-solid', 'box-primary']" :canCollapse="true" :canClose="true" :disableFooter="true">
        <div slot="header">
          <h3 class="box-title">My Documents</h3>
        </div>

        <div slot="body">
          <div :class="addButtonClass">
            <div v-permission.enable="['document', 'createDocument']">
              <router-link :to="{ name: 'DocumentCreate' }">
                <button class="btn btn-primary" v-permission.enable="['document', 'createDocument']">Add Document</button>
              </router-link>
            </div>
          </div>

          <v-server-table ref="documentTable" url="" :columns="documentColumns" :options="documentOptions" v-on:row-click="ownerRowClick" @loaded="onLoaded">
          </v-server-table>
        </div>

        <div v-if="loading" class="overlay">
          <i class="fa"><pulse-loader></pulse-loader></i>
        </div>
      </box>

      <box :classes="['box-solid', 'box-success']" :canCollapse="true" :canClose="true" :disableFooter="true">
        <div slot="header">
          <h3 class="box-title">Shared With Me</h3>
        </div>

        <div slot="body">
          <v-server-table ref="sharedTable" url="" :columns="sharedColumns" :options="sharedOptions" v-on:row-click="sharedRowClick">
          </v-server-table>
        </div>

        <div v-if="loading" class="overlay">
          <i class="fa"><pulse-loader></pulse-loader></i>
        </div>
      </box>
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
        documentColumns: ['title'],
        documentOptions: {
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
            return this.$userRepository.getDocuments(this.$store.state.auth.user._id, params)
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
        },
        sharedColumns: ['title', 'Access', 'Owner'],
        sharedOptions: {
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
            params.$embed = ['owner']
            this.loading = true
            return this.$userRepository.getSharedDocuments(this.$store.state.auth.user._id, params)
              .catch((error) => {
                console.error('Documents.requestFunction-error:', error)
                this.$snotify.error('Get documents failed', 'Error!')
              })
          },
          responseAdapter: (response) => {
            this.loading = false
            response.data.docs = response.data.docs.map((document) => {
              document.Access = document.user_document.canEdit ? 'Edit' : 'View'
              document.Owner = document.owner.firstName + ' ' + document.owner.lastName
              return document
            })
            return { data: response.data.docs, count: response.data.items.total }
          },
          uniqueKey: '_id'
        }
      }
    },
    computed: {
      addButtonClass () {
        if (this.documentTable) {
          return this.documentTable.count > this.documentTable.limit ? 'shift-add-left' : 'add-item'
        } else {
          return 'add-item'
        }
      }
    },
    methods: {
      ownerRowClick (data) {
        this.$router.push({ name: 'DocumentDetails', params: { _id: data.row._id }, query: { canEdit: true } })
      },
      sharedRowClick (data) {
        this.$router.push({ name: 'DocumentDetails', params: { _id: data.row._id }, query: { canEdit: data.row.user_document.canEdit } })
      },
      onLoaded () {
        this.documentTable = this.$refs.documentTable
      }
    }
  }
</script>