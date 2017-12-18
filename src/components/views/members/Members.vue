<template>
  <section class="content">
    <h1 class="text-center">Members</h1>

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
      <template slot="avatar" slot-scope="props">
        <div>
          <!--<a class="fa fa-edit" role="button" v-on:click.stop="edit(props.row)"></a>-->
          <img :src="avatar()" class="user-image" alt="User Image">
        </div>
      </template>
    </v-server-table>

  </section>
</template>

<script>
  import faker from 'faker'

  export default {
    data () {
      return {
        loading: null,
        columns: ['avatar', 'firstName', 'lastName', 'email'],
        options: {
          highlightMatches: true,
          sortable: ['firstName', 'lastName', 'email'],
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
      rowClick (data) {
        this.$router.push({ name: 'MemberProfile', params: { _id: data.row._id }, props: data.row })
      },
      avatar () { return faker.image.avatar() }
    }
  }
</script>

<style lang="scss">
  .add-user {
    position: absolute;
    right: 125px;
  }

  .user-image {
    border-radius: 50%;
    width: 100%;
    max-width: 45px;
    height: auto;
  }
</style>
