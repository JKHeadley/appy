<template>
  <section class="content">
    <div class="nav-tabs-custom">
      <ul class="nav nav-tabs">
        <li class="active"><a href="#contacts" data-toggle="tab">Contacts</a></li>
        <li><a href="#following" data-toggle="tab">Followers</a></li>
        <li><a href="#followers" data-toggle="tab">Following</a></li>
      </ul>
      <div class="tab-content">
        <div class="active tab-pane" id="contacts">
          <v-server-table ref="userTable" url="" :columns="contactColumns" :options="contactOptions" v-on:row-click="rowClick">
            <template slot="beforeBody">
              <tr v-if="loading" class="VueTables__no-results">
                <td class="text-center" colspan="6"><pulse-loader></pulse-loader></td>
              </tr>
            </template>
            <template slot="avatar" slot-scope="props">
              <div>
                <img :src="avatar()" class="user-image" alt="User Image">
              </div>
            </template>
          </v-server-table>
        </div>
        <!-- /.tab-pane -->
        <div class="tab-pane" id="following">
          <v-server-table ref="userTable" url="" :columns="followingColumns" :options="followingOptions" v-on:row-click="rowClick">
            <template slot="beforeBody">
              <tr v-if="loading" class="VueTables__no-results">
                <td class="text-center" colspan="6"><pulse-loader></pulse-loader></td>
              </tr>
            </template>
            <template slot="avatar" slot-scope="props">
              <div>
                <img :src="avatar()" class="user-image" alt="User Image">
              </div>
            </template>
          </v-server-table>
        </div>
        <!-- /.tab-pane -->

        <div class="tab-pane" id="followers">
          <v-server-table ref="userTable" url="" :columns="followerColumns" :options="followerOptions" v-on:row-click="rowClick">
            <template slot="beforeBody">
              <tr v-if="loading" class="VueTables__no-results">
                <td class="text-center" colspan="6"><pulse-loader></pulse-loader></td>
              </tr>
            </template>
            <template slot="avatar" slot-scope="props">
              <div>
                <img :src="avatar()" class="user-image" alt="User Image">
              </div>
            </template>
          </v-server-table>
        </div>
        <!-- /.tab-pane -->
      </div>
      <!-- /.tab-content -->
    </div>

  </section>
</template>

<script>
  import faker from 'faker'

  export default {
    data () {
      return {
        loading: null,
        contactColumns: ['avatar', 'firstName', 'lastName', 'email'],
        contactOptions: {
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
            return this.$userRepository.getConnections(this.$store.state.auth.user._id, { isContact: true, $embed: ['connectedUser'] })
          },
          responseAdapter: (response) => {
            this.loading = false
            const contacts = response.data.docs.map((connection) => { return connection.connectedUser })
            return { data: contacts, count: response.data.items.total }
          },
          uniqueKey: '_id'
        },
        followingColumns: ['avatar', 'firstName', 'lastName', 'email'],
        followingOptions: {
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
            return this.$userRepository.getConnections(this.$store.state.auth.user._id, { isFollowed: true, $embed: ['connectedUser'] })
          },
          responseAdapter: (response) => {
            this.loading = false
            const contacts = response.data.docs.map((connection) => { return connection.connectedUser })
            return { data: contacts, count: response.data.items.total }
          },
          uniqueKey: '_id'
        },
        followerColumns: ['avatar', 'firstName', 'lastName', 'email'],
        followerOptions: {
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
            return this.$userRepository.getConnections(this.$store.state.auth.user._id, { isFollowing: true, $embed: ['connectedUser'] })
          },
          responseAdapter: (response) => {
            this.loading = false
            const contacts = response.data.docs.map((connection) => { return connection.connectedUser })
            return { data: contacts, count: response.data.items.total }
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
