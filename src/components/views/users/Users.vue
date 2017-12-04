<template>
  <section class="content">
    <h1 class="text-center">Users</h1>

    <div class="add-user">
      <router-link :to="{ name: 'UserCreate' }">
        <button class="btn btn-primary">Add User</button>
      </router-link>
    </div>

    <v-server-table ref="userTable" url="" :columns="columns" :options="options" v-on:row-click="rowClick">
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

  </section>
</template>

<script>

export default {
  data () {
    return {
      loading: null,
      columns: ['firstName', 'lastName', 'email', 'roleName', 'edit'],
      options: {
        highlightMatches: true,
        sortable: ['firstName', 'lastName', 'email', 'roleName'],
        texts: {
          loading: 'DUH...'
        },
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
          return this.$userRepository.list(params)
        },
        responseAdapter: (response) => {
          this.loading = false
          return { data: response.data.docs, count: response.data.items.total }
        },
        uniqueKey: '_id'
      }
    }
  },
  methods: {
    edit (row) {
      this.$router.push({ name: 'UserDetails', params: { _id: row._id }, props: row })
    },
    rowClick (data) {
      this.$refs.userTable.toggleChildRow(data.row._id)
    }
  }
}
</script>

<style lang="scss">
  .VueTables.loading {
    tr {
      &.VueTables__no-results {
      }
    }
  }

  .add-user {
    position: absolute;
    right: 15px;
  }
</style>
