<template>
  <section class="content">
    <div class="box box-primary box-solid">
      <div class="box-body">

        <v-server-table ref="auditLogTable" url="" :columns="columns" :options="options" v-on:row-click="rowClick" @loaded="onLoaded">
          <template slot="beforeBody">
            <tr v-if="loading" class="VueTables__no-results">
              <td class="text-center" colspan="7"><pulse-loader></pulse-loader></td>
            </tr>
          </template>
          <template slot="endpoint" slot-scope="props">
            <span>{{props.row.endpoint | shortMessage}}</span>
          </template>
          <template slot="user" slot-scope="props">
            <a href="javascript:;" @click="goToUser(props.row.user)">{{props.row.user}}</a>
          </template>
          <template slot="isError" slot-scope="props">
            <span>{{props.row.isError ? 'true' : 'false'}}</span>
          </template>
          <template slot="date" slot-scope="props">
            <span>{{props.row.date | moment("MMM D, YYYY, h:mm a")}}</span>
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
  name: 'AuditLogs',
  data () {
    return {
      loading: null,
      auditLogTable: null,
      columns: ['endpoint', 'method', 'user', 'ipAddress', 'statusCode', 'isError', 'date'],
      options: {
        highlightMatches: true,
        sortable: ['endpoint', 'method', 'user', 'ipAddress', 'statusCode', 'isError', 'date'],
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
          return this.$auditLogRepository.list(params)
            .catch((error) => {
              console.error('AuditLogs.requestFunction-error:', error)
              this.$snotify.error('Get auditLogs failed', 'Error!')
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
      if (this.auditLogTable) {
        return this.auditLogTable.count > this.auditLogTable.limit ? 'shift-add-left' : 'add-item'
      } else {
        return 'add-item'
      }
    }
  },
  methods: {
    rowClick (data) {
      this.$refs.auditLogTable.toggleChildRow(data.row._id)
    },
    onLoaded () {
      this.auditLogTable = this.$refs.auditLogTable
    },
    goToUser (userId) {
      this.$router.push({ name: 'UserDetails', params: { _id: userId }})
    }
  }
}
</script>