<template>
  <section class="content">
    <div class="box box-primary box-solid">
      <div class="box-body">
        <div :class="addButtonClass" v-permission.if="['role', 'createRole']">
          <router-link :to="{ name: 'RoleCreate' }">
            <button class="btn btn-primary">Add Role</button>
          </router-link>
        </div>

        <v-server-table ref="roleTable" url="" :columns="columns" :options="options" v-on:row-click="rowClick" @loaded="onLoaded">
          <template slot="beforeBody">
            <tr v-if="loading" class="VueTables__no-results">
              <td class="text-center" colspan="6"><pulse-loader></pulse-loader></td>
            </tr>
          </template>
          <template slot="edit" slot-scope="props">
            <div>
              <a class="fa fa-edit" role="button" v-on:click.stop="edit(props.row)"></a>
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
  name: 'Roles',
  data () {
    return {
      loading: null,
      roleTable: null,
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
          } else {
            params.$sort = '-rank'
          }
          if (request.query) {
            params.$term = request.query
          }
          this.loading = true
          return this.$roleRepository.list(params)
            .catch((error) => {
              console.error('Roles.requestFunction-error:', error)
              this.$snotify.error('Get roles failed', 'Error!')
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
        return this.documentTable.count > this.documentTable.limit ? 'shift-add-left' : 'add-item'
      } else {
        return 'add-item'
      }
    }
  },
  methods: {
    edit (row) {
      this.$router.push({ name: 'RoleDetails', params: { _id: row._id }, props: row })
    },
    rowClick (data) {
      this.$refs.roleTable.toggleChildRow(data.row._id)
    },
    onLoaded () {
      this.roleTable = this.$refs.roleTable
    }
  }
}
</script>