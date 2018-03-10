<template>
  <section class="content">

    <!--<div class="callout callout-info">-->
      <!--<h4>Tip!</h4>-->

      <!--<p>Add the layout-top-nav class to the body tag to get this layout. This feature can also be used with a-->
        <!--sidebar! So use this class if you want to remove the custom dropdown menus from the navbar and use regular-->
        <!--links instead.</p>-->
    <!--</div>-->


    <div>
      <!-- USERS LIST -->
      <box :classes="['box-danger']" :canCollapse="true" :canClose="true"
           :disableFooter="false" :headerBorder="true" :noPadding="true">
        <div slot="header">
          <h3 class="box-title">Latest Members</h3>
        </div>
        <!-- /box-header -->

        <span slot="box-tools">
          <!--<span class="label label-danger">8 New Members</span>-->
        </span>
        <!-- /box-tools -->

        <div slot="body">
          <ul class="users-list clearfix">
            <li v-for="user in newMembers">
              <img :src="user.profileImageUrl" alt="User Image">

              <router-link :to="'/members/' + user._id">
                <a class="users-list-name" href="#">{{ getName(user) }}</a>
              </router-link>

              <span class="users-list-date">{{user.createdAt |  moment("D MMM")}}</span>
            </li>
          </ul>
          <!-- /.users-list -->
        </div>
        <!-- /box-body -->

        <div slot="footer" class="text-center">
          <router-link tag="a" class="pageLink uppercase" to="/members" v-permission.enable="['user', 'readUser']">
            View All Members
          </router-link>
        </div>
        <!-- /box-footer -->

        <div v-if="newMembersLoading" class="overlay">
          <i class="fa"><pulse-loader></pulse-loader></i>
        </div>
        <!-- /.overlay -->
      </box>
    </div>
    <!-- /USERS LIST -->
  </section>
</template>

<script>
  import faker from 'faker'

  import ChatBox from '../../utilities/ChatBox.vue'

  export default {
    name: 'Dashboard',
    components: {
    },
    data () {
      return {
        newMembers: {},
        client: null
      }
    },
    computed: {
    },
    methods: {
      avatar () { return faker.image.avatar() },
      getName (user) {
        if (user._id === this.$store.state.auth.user._id) {
          return 'You'
        } else {
          return user.firstName + ' ' + user.lastName
        }
      },
      getNewMembers () {
        this.newMembersLoading = true
        this.$userRepository.list({ $sort: ['-createdAt'], $limit: 8 })
          .then(result => {
            this.newMembersLoading = false
            this.newMembers = result.data.docs
          })
          .catch((error) => {
            this.newMembersLoading = false
            console.error('Dashboard.getNewMembers-error:', error)
            this.$snotify.error('Get new members failed', 'Error!')
          })
      }
    },
    created () {
      this.getNewMembers()
    }
  }
</script>

<style lang="scss">
  .users-list {
    & > li img {
      height: 128px;
    }
  }
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
