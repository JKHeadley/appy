<template>
  <section class="content">
    <h1 class="text-center">Users</h1>

    <v-server-table ref="userTable" url="" :columns="columns" :options="options" v-on:row-click="rowClick">
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
      generateRandomNumbers(numbers, max, min) {
        var a = []
        for (var i = 0; i < numbers; i++) {
          a.push(Math.floor(Math.random() * (max - min + 1)) + max)
        }
        return a
      },
      columns: ['firstName', 'lastName', 'email', 'roleName', 'edit'],
      options: {
        highlightMatches: true,
        sortable: ['firstName', 'lastName', 'email', 'roleName'],
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

<style>
.info-box {
  cursor: pointer;
}
.info-box-content {
  text-align: center;
  vertical-align: middle;
  display: inherit;
}
.fullCanvas {
  width: 100%;
}
</style>
