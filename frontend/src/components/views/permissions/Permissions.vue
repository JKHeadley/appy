<template>
  <section class="content">
    <div class="box box-primary box-solid">
      <div class="box-body">

        <div :class="addButtonClass" v-permission.if="['permission', 'createPermission']">
          <router-link :to="{ name: 'PermissionCreate' }">
            <button class="btn btn-primary">Add Permission</button>
          </router-link>
        </div>

        <v-server-table ref="permissionTable" url="" :columns="columns" :options="options" v-on:row-click="rowClick" @loaded="onLoaded">
          <template slot="beforeBody">
            <tr v-if="loading" class="VueTables__no-results">
              <td class="text-center" colspan="6"><pulse-loader></pulse-loader></td>
            </tr>
          </template>
          <template slot="edit" slot-scope="props">
            <div>
              <a class="fa fa-edit" permission="button" v-on:click.stop="edit(props.row)"></a>
            </div>
          </template>
          <template slot="child_row" slot-scope="props">
            <pre><code>{{props.row}}</code></pre>
          </template>
        </v-server-table>
      </div>
    </div>
  </section>
</template>

<script>

export default {
  name: 'Permissions',
  data () {
    return {
      loading: null,
      permissionTable: null,
      columns: ['name', 'description', 'edit'],
      options: {
        highlightMatches: true,
        sortable: ['name', 'description'],
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
          return this.$permissionRepository.list(params)
            .catch((error) => {
              console.error('Permissions.requestFunction-error:', error)
              this.$snotify.error('Get permissions failed', 'Error!')
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
      if (this.permissionTable) {
        return this.permissionTable.count > this.permissionTable.limit ? 'shift-add-left' : 'add-item'
      } else {
        return 'add-item'
      }
    }
  },
  methods: {
    edit (row) {
      this.$router.push({ name: 'PermissionDetails', params: { _id: row._id }, props: row })
    },
    rowClick (data) {
      this.$refs.permissionTable.toggleChildRow(data.row._id)
    },
    onLoaded () {
      this.permissionTable = this.$refs.permissionTable
    }
  }
}
</script>