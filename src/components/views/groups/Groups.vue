<template>
  <section class="content">
    <h1 class="text-center">Groups</h1>

    <div class="add-group">
      <router-link :to="{ name: 'GroupCreate' }">
        <button class="btn btn-primary">Add Group</button>
      </router-link>
    </div>

    <v-server-table ref="groupTable" url="" :columns="columns" :options="options" v-on:row-click="rowClick">
      <template slot="beforeBody">
        <tr v-if="loading" class="VueTables__no-results">
          <td class="text-center" colspan="6"><pulse-loader></pulse-loader></td>
        </tr>
      </template>
      <template slot="edit" slot-scope="props">
        <div>
          <a class="fa fa-edit" group="button" v-on:click.stop="edit(props.row)"></a>
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
  name: 'Groups',
  data () {
    return {
      loading: null,
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
          return this.$groupRepository.list(params)
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
      this.$router.push({ name: 'GroupDetails', params: { _id: row._id }, props: row })
    },
    rowClick (data) {
      this.$refs.groupTable.toggleChildRow(data.row._id)
    }
  }
}
</script>

<style lang="scss">
  .add-group {
    position: absolute;
    right: 15px;
  }
</style>
