<template>
  <section class="content">
    <div v-if="loading" class="content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-show="!loading" v-if="ready" class="row">
      <div class="col-md-4">

        <!-- Profile Image -->
        <div class="box box-primary">
          <div class="box-body box-profile">
            <img class="profile-user-img img-responsive img-circle" :src="avatar()" alt="User profile picture">

            <h3 class="profile-username text-center">Nina Mcintire</h3>

            <p class="text-muted text-center">Software Engineer</p>

            <ul class="list-group list-group-unbordered">
              <li class="list-group-item">
                <b>Followers</b> <a class="pull-right">{{connectionStats.followers}}</a>
              </li>
              <li class="list-group-item">
                <b>Following</b> <a class="pull-right">{{connectionStats.following}}</a>
              </li>
              <li class="list-group-item">
                <b>Contacts</b> <a class="pull-right">{{connectionStats.contacts}}</a>
              </li>
            </ul>

            <a v-if="!connection.isContact" href="#" class="btn btn-primary outline btn-block" @click="addContact"><b>Connect</b></a>
            <a v-if="connection.isContact" href="#" class="btn btn-primary outline btn-block" @click="removeContact"><b>Remove Contact</b></a>
            <a v-if="!connection.isFollowing" href="#" class="btn btn-primary btn-block" @click="followUser"><b>Follow</b></a>
            <a v-if="connection.isFollowing" href="#" class="btn btn-primary btn-block" @click="unfollowUser"><b>Unfollow</b></a>
            <a href="#" class="btn btn-success btn-block"><b>Message</b></a>
          </div>
          <!-- /.box-body -->
        </div>
        <!-- /.box -->

        <!-- About Me Box -->
        <div class="box box-primary">
          <div class="box-header with-border">
            <h3 class="box-title">About Me</h3>
          </div>
          <!-- /.box-header -->
          <div class="box-body">
            <strong><i class="fa fa-book margin-r-5"></i> Education</strong>

            <p class="text-muted">
              B.S. in Computer Science from the University of Tennessee at Knoxville
            </p>

            <hr>

            <strong><i class="fa fa-map-marker margin-r-5"></i> Location</strong>

            <p class="text-muted">Malibu, California</p>

            <hr>

            <strong><i class="fa fa-pencil margin-r-5"></i> Skills</strong>

            <p>
              <span class="label label-danger">UI Design</span>
              <span class="label label-success">Coding</span>
              <span class="label label-info">Javascript</span>
              <span class="label label-warning">PHP</span>
              <span class="label label-primary">Node.js</span>
            </p>

            <hr>

            <strong><i class="fa fa-file-text-o margin-r-5"></i> Notes</strong>

            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam fermentum enim neque.</p>
          </div>
          <!-- /.box-body -->
        </div>
        <!-- /.box -->
      </div>
      <!-- /.col -->
    </div>
  </section>
</template>

<script>
  import { userService } from '../../../services'
  import { EVENTS } from '../../../config'

  import _ from 'lodash'
  import faker from 'faker'

  export default {
    name: 'MemberProfile',
    components: {
    },
    data () {
      return {
        ready: false,
        loading: false,
        EVENTS: EVENTS,
        user: {},
        connection: {},
        connectionStats: {},
        roles: [],
        permissions: [],
        formstate: {}
      }
    },
    computed: {
      computedUserScope () {
        return userService.computeUserScope(this.user)
      }
    },
    methods: {
      avatar () { return faker.image.avatar() },
      image () { return faker.image() },
      getUser () {
        this.loading = true
        const params = {}
        const promises = []
        let promise = {}

        promise = this.$userRepository.find(this.$route.params._id, params)
          .then((response) => {
            this.user = response.data
            this.$store.dispatch('setBreadcrumbTitle', this.user.firstName + ' ' + this.user.lastName)
          })
        promises.push(promise)
        return Promise.all(promises)
          .then(() => {
            this.loading = false
          })
      },
      getConnection () {
        this.loading = true
        const params = {
          connectedUser: this.$route.params._id
        }
        const promises = []
        let promise = {}

        promise = this.$userRepository.getConnections(this.$store.state.auth.user._id, params)
          .then((response) => {
            this.connection = response.data.docs[0] || {}
          })
        promises.push(promise)
        return Promise.all(promises)
          .then(() => {
            this.loading = false
          })
      },
      getConnectionStats () {
        this.loading = true

        return userService.getConnectionStats(this.$route.params._id)
          .then((response) => {
            this.loading = false
            this.connectionStats = response.data
          })
      },
      addContact () {
        this.loading = true
        const params = {
          primaryUser: this.$store.state.auth.user._id,
          connectedUser: this.user._id,
          isContact: true
        }
        let promise = {}
        if (this.connection && this.connection._id) {
          promise = this.$connectionRepository.update(this.connection._id, params)
        } else {
          promise = this.$connectionRepository.create(params)
        }
        return promise
          .then((response) => {
            this.connection = response.data
            this.connectionStats.contacts += 1
            this.loading = false
            this.$snotify.success('Contact added', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('MemberProfile.addContact-error:', error)
            this.$snotify.error('Add contact failed', 'Error!')
          })
      },
      removeContact () {
        this.loading = true
        const params = {
          isContact: false
        }
        return this.$connectionRepository.update(this.connection._id, params)
          .then((response) => {
            this.connection = response.data
            this.connectionStats.contacts -= 1
            this.loading = false
            this.$snotify.success('Contact removed', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('MemberProfile.removeContact-error:', error)
            this.$snotify.error('Remove contact failed', 'Error!')
          })
      },
      followUser () {
        this.loading = true
        const params = {
          primaryUser: this.$store.state.auth.user._id,
          connectedUser: this.user._id,
          isFollowing: true
        }
        let promise = {}
        if (this.connection && this.connection._id) {
          promise = this.$connectionRepository.update(this.connection._id, params)
        } else {
          promise = this.$connectionRepository.create(params)
        }
        return promise
          .then((response) => {
            this.connection = response.data
            this.connectionStats.followers += 1
            this.loading = false
            this.$snotify.success('Following member', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('MemberProfile.followUser-error:', error)
            this.$snotify.error('Follow member failed', 'Error!')
          })
      },
      unfollowUser () {
        this.loading = true
        const params = {
          primaryUser: this.$store.state.auth.user._id,
          connectedUser: this.user._id,
          isFollowing: false
        }
        let promise = {}
        if (this.connection && this.connection._id) {
          promise = this.$connectionRepository.update(this.connection._id, params)
        } else {
          promise = this.$connectionRepository.create(params)
        }
        return promise
          .then((response) => {
            this.connection = response.data
            this.connectionStats.followers -= 1
            this.loading = false
            this.$snotify.success('Unfollowing member', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('MemberProfile.unfollowUser-error:', error)
            this.$snotify.error('Unfollow member failed', 'Error!')
          })
      },
    },
    created () {
      const promises = []
      promises.push(this.getUser())
      promises.push(this.getConnection())
      promises.push(this.getConnectionStats())
      Promise.all(promises)
        .then(() => {
          this.loading = false
          this.ready = true
        })
    },
    beforeDestroy () {
    }
  }
</script>
