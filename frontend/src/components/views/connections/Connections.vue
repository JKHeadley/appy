<template>
  <section class="content">

    <div v-if="!ready" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>


    <div v-if="ready">
      <box :classes="['box-solid', 'box-success']" :canCollapse="true" :canClose="true" :disableFooter="true">
        <div slot="header">
          <h3 class="box-title">Contacts</h3>
        </div>

        <div slot="body">
          <v-server-table ref="userTable" url="" :columns="contactColumns" :options="contactOptions" v-on:row-click="rowClick">
            <template slot="avatar" slot-scope="props">
              <div>
                <img :src="props.row.profileImageUrl" class="user-image" alt="User Image">
              </div>
            </template>
          </v-server-table>
        </div>

        <div v-if="contactsLoading" class="overlay">
          <i class="fa"><pulse-loader></pulse-loader></i>
        </div>
      </box>


      <box :classes="['box-solid', 'box-info']" :canCollapse="true" :canClose="true" :disableFooter="true">
        <div slot="header">
          <h3 class="box-title">Following</h3>
        </div>

        <div slot="body">
          <v-server-table ref="userTable" url="" :columns="followingColumns" :options="followingOptions" v-on:row-click="rowClick">
            <template slot="avatar" slot-scope="props">
              <div>
                <img :src="props.row.profileImageUrl" class="user-image" alt="User Image">
              </div>
            </template>
          </v-server-table>
        </div>

        <div v-if="followingLoading" class="overlay">
          <i class="fa"><pulse-loader></pulse-loader></i>
        </div>
      </box>

      <box :classes="['box-solid', 'box-primary']" :canCollapse="true" :canClose="true" :disableFooter="true">
        <div slot="header">
          <h3 class="box-title">Followers</h3>
        </div>

        <div slot="body">
          <v-server-table ref="userTable" url="" :columns="followerColumns" :options="followerOptions" v-on:row-click="rowClick">
            <template slot="avatar" slot-scope="props">
              <div>
                <img :src="props.row.profileImageUrl" class="user-image" alt="User Image">
              </div>
            </template>
          </v-server-table>
        </div>

        <div v-if="followersLoading" class="overlay">
          <i class="fa"><pulse-loader></pulse-loader></i>
        </div>
      </box>
    </div>

  </section>
</template>

<script>
  import faker from 'faker'
  import Box from '../../utilities/Box.vue'

  export default {
    components: {Box},
    data () {
      return {
        ready: false,
        contactsLoading: null,
        followingLoading: null,
        followersLoading: null,
        contactIds: [],
        followingIds: [],
        followerIds: [],
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
            if (this.contactIds[0]) {
              params._id = this.contactIds
              this.contactsLoading = true
              return this.$userRepository.list(params)
            } else {
              return Promise.resolve(null)
            }
          },
          responseAdapter: (response) => {
            this.contactsLoading = false
            return response ? { data: response.data.docs, count: response.data.items.total } : { data: [], count: 0 }
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
            if (this.followingIds[0]) {
              params._id = this.followingIds
              this.followingLoading = true
              return this.$userRepository.list(params)
            } else {
              return Promise.resolve(null)
            }
          },
          responseAdapter: (response) => {
            this.followingLoading = false
            return response ? { data: response.data.docs, count: response.data.items.total } : { data: [], count: 0 }
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
            if (this.followerIds[0]) {
              params._id = this.followerIds
              this.followersLoading = true
              return this.$userRepository.list(params)
            } else {
              return Promise.resolve(null)
            }
          },
          responseAdapter: (response) => {
            this.followersLoading = false
            return response ? { data: response.data.docs, count: response.data.items.total } : { data: [], count: 0 }
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
    },
    created () {
      const promises = []
      promises.push(this.$userRepository.getConnections(this.$store.state.auth.user._id, { isContact: true, $select: ['connectedUser'] }))
      promises.push(this.$userRepository.getConnections(this.$store.state.auth.user._id, { isFollowing: true, $select: ['connectedUser'] }))
      promises.push(this.$userRepository.getConnections(this.$store.state.auth.user._id, { isFollowed: true, $select: ['connectedUser'] }))

      Promise.all(promises)
        .then((response) => {
          this.contactIds = response[0].data.docs.map((user) => { return user.connectedUser })
          this.followingIds = response[1].data.docs.map((user) => { return user.connectedUser })
          this.followerIds = response[2].data.docs.map((user) => { return user.connectedUser })
          this.ready = true
        })
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