<template>
  <ul class="sidebar-menu" data-widget="tree">
    <li class="header">{{role}}</li>
    <div class="sidebar-menu" v-if="user.roleName === USER_ROLES.ADMIN || user.roleName === USER_ROLES.SUPER_ADMIN">
      <router-link tag="li" class="pageLink" to="/users">
        <a>
          <i class="fa fa-user"></i>
          <span class="page">Users</span>
        </a>
      </router-link>
      <router-link tag="li" class="pageLink" to="/roles">
        <a>
          <i class="fa fa-id-card"></i>
          <span class="page">Roles</span>
        </a>
      </router-link>
      <router-link tag="li" class="pageLink" to="/groups">
        <a>
          <i class="fa fa-users"></i>
          <span class="page">Groups</span>
        </a>
      </router-link>
      <router-link tag="li" class="pageLink" to="/permissions">
        <a>
          <i class="fa fa-key"></i>
          <span class="page">Permissions</span>
        </a>
      </router-link>
      <router-link tag="li" class="pageLink" to="/audit-logs">
        <a>
          <i class="fa fa-book"></i>
          <span class="page">Audit Logs</span>
        </a>
      </router-link>
    </div>

    <li class="header">PEOPLE</li>
    <router-link tag="li" class="pageLink" to="/connections">
      <a>
        <i class="fa fa-users"></i>
        <span class="page">Connections</span>
      </a>
    </router-link>
    <router-link tag="li" class="pageLink" to="/members">
      <a>
        <i class="fa fa-users"></i>
        <span class="page">Members</span>
      </a>
    </router-link>
    <router-link tag="li" class="pageLink" to="/members">
      <a>
        <i class="fa fa-users"></i>
        <span class="page">Chat</span>
      </a>
    </router-link>
    <router-link tag="li" class="pageLink" to="/members">
      <a>
        <i class="fa fa-users"></i>
        <span class="page">Mail</span>
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
  import { USER_ROLES } from '../../../config'
  export default {
    name: 'SidebarName',
    data () {
      return {
        role: '',
        USER_ROLES: USER_ROLES
      }
    },
    created () {
      this.user = this.$store.state.auth.user
      this.role = this.$store.state.auth.user.roleName.toUpperCase()
    }
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
