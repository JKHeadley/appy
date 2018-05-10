<template>
  <div :class="['wrapper', classes]">
    <!-- Left side column. contains the logo and sidebar -->
    <main-header :display-name="displayName" :picture-url="user.profileImageUrl" />

    <!-- Left side column. contains the logo and sidebar -->
    <sidebar :display-name="displayName" :picture-url="user.profileImageUrl" />

    <!-- Content Wrapper. Contains page content -->
    <div class="content-wrapper">
      <content-header></content-header>
      <router-view></router-view>
    </div>
    <!-- /.content-wrapper -->

    <!-- Chat Box -->
    <chat-box></chat-box>
    <!-- Create Group Chat -->
    <new-group-chat></new-group-chat>

    <!-- Main Footer -->
    <footer class="main-footer">
      <strong>Copyright &copy; {{year}}
        <a href="javascript:;">appy</a>.</strong> All rights reserved.
    </footer>
  </div>
  <!-- ./wrapper -->
</template>

<script>
import faker from 'faker'
import { mapState } from 'vuex'
import config from '../../../config'

import MainHeader from './MainHeader.vue'
import ContentHeader from './ContentHeader.vue'
import Sidebar from './Sidebar.vue'
import 'hideseek'
import NewGroupChat from '../../utilities/NewGroupChat.vue'

export default {
  name: 'Main',
  components: {
    NewGroupChat,
    MainHeader,
    ContentHeader,
    Sidebar
  },
  data: function () {
    return {
      // section: 'Dash',
      user: null,
      year: new Date().getFullYear(),
      classes: {
        fixed_layout: config.fixedLayout,
        hide_logo: config.hideLogoOnMobile
      },
      error: ''
    }
  },
  computed: {
    ...mapState([
      'userInfo'
    ]),
    demo () {
      return {
        displayName: faker.name.findName(),
        avatar: faker.image.avatar(),
        email: faker.internet.email(),
        randomCard: faker.helpers.createCard()
      }
    },
    displayName () {
      return this.user.firstName + ' ' + this.user.lastName
    }
  },
  methods: {
    changeloading () {
      this.$store.commit('TOGGLE_SEARCHING')
    }
  },
  created () {
    this.user = this.$store.state.auth.user
  }
}
</script>

<style lang="scss">
  .wrapper.fixed_layout {
    .main-header {
      position: fixed;
      width: 100%;
    }

    .content-wrapper {
      padding-top: 50px;
    }

    .main-sidebar {
      position: fixed;
      height: 100vh;
    }
  }

  .wrapper.hide_logo {
    @media (max-width: 767px) {
      .main-header .logo {
        display: none;
      }
    }
  }

  .logo-mini,
  .logo-lg {
    text-align: left;

    img {
      padding: .4em !important;
    }
  }

  .logo-lg {
    img {
      display: -webkit-inline-box;
      width: 25%;
    }
  }

  .user-panel {
    height: 4em;
  }

  hr.visible-xs-block {
    width: 100%;
    background-color: rgba(0, 0, 0, 0.17);
    height: 1px;
    border-color: transparent;
  }

</style>