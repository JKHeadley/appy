<template>
  <ul class="sidebar-menu" data-widget="tree">
    <div class="sidebar-menu" v-permission.if="[USER_ROLES.ADMIN]">
      <li class="header">ADMIN</li>
      <router-link tag="li" class="pageLink" to="/users" v-permission.enable="['user', 'readUser']">
        <a>
          <i class="fa fa-user"></i>
          <span class="page">Users</span>
        </a>
      </router-link>
      <router-link tag="li" class="pageLink" to="/roles" v-permission.enable="['role', 'readRole']">
        <a>
          <i class="fa fa-id-card"></i>
          <span class="page">Roles</span>
        </a>
      </router-link>
      <router-link tag="li" class="pageLink" to="/groups" v-permission.enable="['group', 'readGroup']">
        <a>
          <i class="fa fa-users"></i>
          <span class="page">Groups</span>
        </a>
      </router-link>
      <router-link tag="li" class="pageLink" to="/permissions" v-permission.enable="['permission', 'readPermission']">
        <a>
          <i class="fa fa-key"></i>
          <span class="page">Permissions</span>
        </a>
      </router-link>
      <router-link tag="li" class="pageLink" to="/audit-logs" v-permission.enable="['auditLog', 'readAuditLog']">
        <a>
          <i class="fa fa-book"></i>
          <span class="page">Audit Logs</span>
        </a>
      </router-link>
    </div>

    <div class="sidebar-menu">
      <li class="header">USER</li>
      <router-link tag="li" class="pageLink" to="/">
        <a>
          <i class="fa fa-dashboard"></i>
          <span class="page">Dashboard</span>
        </a>
      </router-link>
      <li class="pageLink" @click="openNewMessageBox" v-permission.enable="['readMyConversations']">
        <a>
          <i class="fa fa-comments"></i>
          <span class="page">Chat</span>
        </a>
      </li>
      <li class="pageLink" v-tooltip="'Coming Soon!'">
        <a>
          <i class="fa fa-envelope"></i>
          <span class="page">Mail</span>
        </a>
      </li>
    </div>

    <li class="header">PEOPLE</li>
    <router-link tag="li" class="pageLink" to="/connections">
      <a>
        <i class="fa fa-handshake-o"></i>
        <span class="page">Connections</span>
      </a>
    </router-link>
    <router-link tag="li" class="pageLink" to="/members" v-permission.enable="['user', 'readUser']">
      <a>
        <i class="fa fa-address-book"></i>
        <span class="page">Members</span>
      </a>
    </router-link>

    <li class="header">FILES</li>
    <router-link tag="li" class="pageLink" to="/documents">
      <a>
        <i class="fa fa-file-word-o"></i>
        <span class="page">Documents</span>
      </a>
    </router-link>
    <router-link tag="li" class="pageLink" to="/images">
      <a>
        <i class="fa fa-file-picture-o"></i>
        <span class="page">Images</span>
      </a>
    </router-link>
    <li>
      <a href="#" v-tooltip="'Coming Soon!'">
        <i class="fa fa-file-pdf-o"></i> PDFs
      </a>
    </li>

    <li class="header">PAGES</li>
    <router-link tag="li" class="pageLink" to="/login">
      <a>
        <i class="fa fa-circle-o text-yellow"></i>
        <span class="page"> Login</span>
      </a>
    </router-link>
  </ul>
</template>

<script>
  import { USER_ROLES, EVENTS } from '../../../config'
  import { eventBus } from '../../../services'
  export default {
    name: 'SidebarName',
    data () {
      return {
        role: '',
        USER_ROLES: USER_ROLES
      }
    },
    methods: {
      openNewMessageBox () {
        eventBus.$emit(EVENTS.OPEN_CHAT, { new: true })
      }
    },
    created () {
      this.user = this.$store.state.auth.user
      this.role = this.$store.state.auth.user.roleName.toUpperCase()
    },
  }
</script>

<style lang="scss">
  /* override default */
  .sidebar-menu>li>a {
    padding: 12px 15px 12px 15px;
  }

  /*.sidebar-menu {*/
    /*div {*/
      /*li {*/
        /*a {*/
          /*padding: 12px 15px 12px 15px;*/
        /*}*/
      /*}*/
    /*}*/
  /*}*/

  .sidebar-menu li.active>a>.fa-angle-left, .sidebar-menu li.active>a>.pull-right-container>.fa-angle-left {
    animation-name: rotate;
    animation-duration: .2s;
    animation-fill-mode: forwards;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(-90deg);
    }
  }
</style>