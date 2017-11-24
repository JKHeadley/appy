<template>
  <div>
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
  </div>
</template>

<script>

export default {
  data () {
    return {
      generateRandomNumbers(numbers, max, min) {
        var a = []
        for (var i = 0; i < numbers; i++) {
          a.push(Math.floor(Math.random() * (max - min + 1)) + max)
        }
        return a
      },
      columns: ['firstName', 'lastName', 'email', 'roleName', 'edit'],
      options: {
        sortable: ['firstName', 'lastName', 'email', 'roleName'],
        requestFunction: function (request) {
          const params = {}
          params.$page = request.page
          params.$limit = request.limit
          if (request.orderBy) {
            params.$sort = request.ascending ? '-' + request.orderBy : request.orderBy
          }
          if (request.query) {
            params.$term = request.query
          }
          return this.$userRepository.list(params)
        },
        responseAdapter: function (response) {
          return { data: response.data.docs, count: response.data.items.total }
        },
        uniqueKey: '_id'
      }
    }
  },
  methods: {
    edit (row) {
      console.log("EDIT:", row._id)
      this.$router.push({ name: 'UserDetails', params: { _id: row._id }, props: row })
//      this.$router.push('test')
    },
    rowClick (data) {
      this.$refs.userTable.toggleChildRow(data.row._id)
      console.log("ROW")
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
