<template>
  <section class="content">
    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-show="!loading" v-if="ready" class="row">
      <div class="col-md-3">

        <!-- Profile Image -->
        <div class="box box-primary">
          <div class="box-body box-profile">
            <img class="profile-user-img img-responsive img-circle" :src="user.profileImageUrl" alt="User profile picture">

            <h3 class="profile-username text-center">{{user.firstName}} {{user.lastName}}</h3>

            <p class="text-muted text-center">{{user.title}}</p>

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

            <a v-if="!connection.isContact" href="#" :disabled="isSelf" class="btn btn-primary outline btn-block" @click="addContact"
               v-permission.enable="['connection', 'createConnection', 'updateConnection']"><b>Connect</b></a>
            <a v-if="connection.isContact" href="#" class="btn btn-primary outline btn-block" @click="removeContact"
               v-permission.enable="['connection', 'createConnection', 'updateConnection']"><b>Remove Contact</b></a>
            <a v-if="!connection.isFollowing" href="#" :disabled="isSelf" class="btn btn-primary btn-block" @click="followUser"
               v-permission.enable="['connection', 'createConnection', 'updateConnection']"><b>Follow</b></a>
            <a v-if="connection.isFollowing" href="#" class="btn btn-primary btn-block" @click="unfollowUser"
               v-permission.enable="['connection', 'createConnection', 'updateConnection']"><b>Unfollow</b></a>
            <a href="#" class="btn btn-success btn-block" :disabled="isSelf" @click="openChatBox"><b>Message</b></a>
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
              {{user.education}}
            </p>

            <hr>

            <strong><i class="fa fa-map-marker margin-r-5"></i> Location</strong>

            <p class="text-muted">{{user.location}}</p>

            <hr>

            <strong><i class="fa fa-pencil margin-r-5"></i> Skills (Coming Soon)</strong>

            <p>
              <span class="label label-danger">UI Design</span>
              <span class="label label-success">Coding</span>
              <span class="label label-info">Javascript</span>
              <span class="label label-warning">PHP</span>
              <span class="label label-primary">Node.js</span>
            </p>

            <hr>

            <strong><i class="fa fa-file-text-o margin-r-5"></i> Bio</strong>

            <p>{{user.bio}}</p>
          </div>
          <!-- /.box-body -->
        </div>
        <!-- /.box -->
      </div>
      <!-- /.col -->


      <div class="col-md-9">
        <div>
          <div class="callout callout-info">
            <h4>Coming Soon!</h4>

            <p>Live Activity and Timeline will be included in future versions of appy.</p>
          </div>
        </div>
        <div>
          <div class="nav-tabs-custom">
            <ul class="nav nav-tabs">
              <li class="active"><a href="#activity" data-toggle="tab">Activity</a></li>
              <li><a href="#timeline" data-toggle="tab">Timeline</a></li>
            </ul>
            <div class="tab-content">
              <div class="active tab-pane" id="activity">
                <!-- Post -->
                <div class="post">
                  <div class="user-block">
                    <img class="img-circle img-bordered-sm" src="../../../../static/img/demo/user1-128x128.jpg" alt="user image">
                    <span class="username">
                          <a href="#">Jonathan Burke Jr.</a>
                          <a href="#" class="pull-right btn-box-tool"><i class="fa fa-times"></i></a>
                        </span>
                    <span class="description">Shared publicly - 7:30 PM today</span>
                  </div>
                  <!-- /.user-block -->
                  <p>
                    Lorem ipsum represents a long-held tradition for designers,
                    typographers and the like. Some people hate it and argue for
                    its demise, but others ignore the hate as they create awesome
                    tools to help create filler text for everyone from bacon lovers
                    to Charlie Sheen fans.
                  </p>
                  <ul class="list-inline">
                    <li><a href="#" class="link-black text-sm"><i class="fa fa-share margin-r-5"></i> Share</a></li>
                    <li><a href="#" class="link-black text-sm"><i class="fa fa-thumbs-o-up margin-r-5"></i> Like</a>
                    </li>
                    <li class="pull-right">
                      <a href="#" class="link-black text-sm"><i class="fa fa-comments-o margin-r-5"></i> Comments
                        (5)</a></li>
                  </ul>

                  <input class="form-control input-sm" type="text" placeholder="Type a comment">
                </div>
                <!-- /.post -->

                <!-- Post -->
                <div class="post clearfix">
                  <div class="user-block">
                    <img class="img-circle img-bordered-sm" src="../../../../static/img/demo/user7-128x128.jpg" alt="User Image">
                    <span class="username">
                          <a href="#">Sarah Ross</a>
                          <a href="#" class="pull-right btn-box-tool"><i class="fa fa-times"></i></a>
                        </span>
                    <span class="description">Sent you a message - 3 days ago</span>
                  </div>
                  <!-- /.user-block -->
                  <p>
                    Lorem ipsum represents a long-held tradition for designers,
                    typographers and the like. Some people hate it and argue for
                    its demise, but others ignore the hate as they create awesome
                    tools to help create filler text for everyone from bacon lovers
                    to Charlie Sheen fans.
                  </p>

                  <form class="form-horizontal">
                    <div class="form-group margin-bottom-none">
                      <div class="col-sm-9">
                        <input class="form-control input-sm" placeholder="Response">
                      </div>
                      <div class="col-sm-3">
                        <button type="submit" class="btn btn-danger pull-right btn-block btn-sm">Send</button>
                      </div>
                    </div>
                  </form>
                </div>
                <!-- /.post -->

                <!-- Post -->
                <div class="post">
                  <div class="user-block">
                    <img class="img-circle img-bordered-sm" src="../../../../static/img/demo/user6-128x128.jpg" alt="User Image">
                    <span class="username">
                          <a href="#">Adam Jones</a>
                          <a href="#" class="pull-right btn-box-tool"><i class="fa fa-times"></i></a>
                        </span>
                    <span class="description">Posted 5 photos - 5 days ago</span>
                  </div>
                  <!-- /.user-block -->
                  <div class="row margin-bottom">
                    <div class="col-sm-6">
                      <img class="img-responsive" src="../../../../static/img/demo/photo1.png" alt="Photo">
                    </div>
                    <!-- /.col -->
                    <div class="col-sm-6">
                      <div class="row">
                        <div class="col-sm-6">
                          <img class="img-responsive" src="../../../../static/img/demo/photo2.png" alt="Photo">
                          <br>
                          <img class="img-responsive" src="../../../../static/img/demo/photo3.jpg" alt="Photo">
                        </div>
                        <!-- /.col -->
                        <div class="col-sm-6">
                          <img class="img-responsive" src="../../../../static/img/demo/photo4.jpg" alt="Photo">
                          <br>
                          <img class="img-responsive" src="../../../../static/img/demo/photo1.png" alt="Photo">
                        </div>
                        <!-- /.col -->
                      </div>
                      <!-- /.row -->
                    </div>
                    <!-- /.col -->
                  </div>
                  <!-- /.row -->

                  <ul class="list-inline">
                    <li><a href="#" class="link-black text-sm"><i class="fa fa-share margin-r-5"></i> Share</a></li>
                    <li><a href="#" class="link-black text-sm"><i class="fa fa-thumbs-o-up margin-r-5"></i> Like</a>
                    </li>
                    <li class="pull-right">
                      <a href="#" class="link-black text-sm"><i class="fa fa-comments-o margin-r-5"></i> Comments
                        (5)</a></li>
                  </ul>

                  <input class="form-control input-sm" type="text" placeholder="Type a comment">
                </div>
                <!-- /.post -->
              </div>
              <!-- /.tab-pane -->
              <div class="tab-pane" id="timeline">
                <!-- The timeline -->
                <ul class="timeline timeline-inverse">
                  <!-- timeline time label -->
                  <li class="time-label">
                        <span class="bg-red">
                          10 Feb. 2014
                        </span>
                  </li>
                  <!-- /.timeline-label -->
                  <!-- timeline item -->
                  <li>
                    <i class="fa fa-envelope bg-blue"></i>

                    <div class="timeline-item">
                      <span class="time"><i class="fa fa-clock-o"></i> 12:05</span>

                      <h3 class="timeline-header"><a href="#">Support Team</a> sent you an email</h3>

                      <div class="timeline-body">
                        Etsy doostang zoodles disqus groupon greplin oooj voxy zoodles,
                        weebly ning heekya handango imeem plugg dopplr jibjab, movity
                        jajah plickers sifteo edmodo ifttt zimbra. Babblely odeo kaboodle
                        quora plaxo ideeli hulu weebly balihoo...
                      </div>
                      <div class="timeline-footer">
                        <a class="btn btn-primary btn-xs">Read more</a>
                        <a class="btn btn-danger btn-xs">Delete</a>
                      </div>
                    </div>
                  </li>
                  <!-- END timeline item -->
                  <!-- timeline item -->
                  <li>
                    <i class="fa fa-user bg-aqua"></i>

                    <div class="timeline-item">
                      <span class="time"><i class="fa fa-clock-o"></i> 5 mins ago</span>

                      <h3 class="timeline-header no-border"><a href="#">Sarah Young</a> accepted your friend request
                      </h3>
                    </div>
                  </li>
                  <!-- END timeline item -->
                  <!-- timeline item -->
                  <li>
                    <i class="fa fa-comments bg-yellow"></i>

                    <div class="timeline-item">
                      <span class="time"><i class="fa fa-clock-o"></i> 27 mins ago</span>

                      <h3 class="timeline-header"><a href="#">Jay White</a> commented on your post</h3>

                      <div class="timeline-body">
                        Take me to your leader!
                        Switzerland is small and neutral!
                        We are more like Germany, ambitious and misunderstood!
                      </div>
                      <div class="timeline-footer">
                        <a class="btn btn-warning btn-flat btn-xs">View comment</a>
                      </div>
                    </div>
                  </li>
                  <!-- END timeline item -->
                  <!-- timeline time label -->
                  <li class="time-label">
                        <span class="bg-green">
                          3 Jan. 2014
                        </span>
                  </li>
                  <!-- /.timeline-label -->
                  <!-- timeline item -->
                  <li>
                    <i class="fa fa-camera bg-purple"></i>

                    <div class="timeline-item">
                      <span class="time"><i class="fa fa-clock-o"></i> 2 days ago</span>

                      <h3 class="timeline-header"><a href="#">Mina Lee</a> uploaded new photos</h3>

                      <div class="timeline-body">
                        <img src="https://placehold.it/150x100" alt="..." class="margin">
                        <img src="https://placehold.it/150x100" alt="..." class="margin">
                        <img src="https://placehold.it/150x100" alt="..." class="margin">
                        <img src="https://placehold.it/150x100" alt="..." class="margin">
                      </div>
                    </div>
                  </li>
                  <!-- END timeline item -->
                  <li>
                    <i class="fa fa-clock-o bg-gray"></i>
                  </li>
                </ul>
              </div>
              <!-- /.tab-pane -->
            </div>
            <!-- /.tab-content -->
          </div>
          <!-- /.nav-tabs-custom -->
        </div>
      </div>
      <!-- /.col -->

    </div>
  </section>
</template>

<script>
  import { userService, eventBus } from '../../../services'
  import { EVENTS } from '../../../config'

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
      },
      isSelf () {
        return this.$store.state.auth.user._id === this.$route.params._id
      }
    },
    methods: {
      init () {
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
        if (!this.isSelf) {
          this.loading = true
          const params = {
            isContact: true
          }
          let promise = {}
          if (this.connection && this.connection._id) {
            promise = this.$connectionRepository.update(this.connection._id, params)
          } else {
            params.primaryUser = this.$store.state.auth.user._id
            params.connectedUser = this.user._id
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
        }
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
        if (!this.isSelf) {
          this.loading = true
          const params = {
            isFollowing: true
          }
          let promise = {}
          if (this.connection && this.connection._id) {
            promise = this.$connectionRepository.update(this.connection._id, params)
          } else {
            params.primaryUser = this.$store.state.auth.user._id
            params.connectedUser = this.user._id
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
        }
      },
      unfollowUser () {
        this.loading = true
        const params = {
          isFollowing: false
        }
        return this.$connectionRepository.update(this.connection._id, params)
          .then((response) => {
            this.connection = response.data
            this.connectionStats.followers -= 1
            this.loading = false
            this.$snotify.success('Contact removed', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('MemberProfile.unfollowUser-error:', error)
            this.$snotify.error('Unfollow member failed', 'Error!')
          })
      },
      openChatBox () {
        if (!this.isSelf) {
          eventBus.$emit(EVENTS.OPEN_CHAT, { user: this.user })
        }
      }
    },
    beforeRouteUpdate (to, from, next) {
      next()
      this.init()
    },
    created () {
      this.init()
    },
    beforeDestroy () {
    }
  }
</script>

<style lang="scss">
</style>