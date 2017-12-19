<template>
  <ul class="sidebar-menu" data-widget="tree">
    <li class="header">{{role}}</li>
    <div class="sidebar-menu" v-show="user.roleName === USER_ROLES.ADMIN || user.roleName === USER_ROLES.SUPER_ADMIN">
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
      <router-link tag="li" class="pageLink" to="/tables">
        <a>
          <i class="fa fa-table"></i>
          <span class="page">Tables</span>
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

    <li class="header">ME</li>
    <router-link tag="li" class="pageLink" to="/tasks">
      <a>
        <i class="fa fa-tasks"></i>
        <span class="page">Tasks</span>
      </a>
    </router-link>
    <router-link tag="li" class="pageLink" to="/setting">
      <a>
        <i class="fa fa-cog"></i>
        <span class="page">Settings</span>
      </a>
    </router-link>
    <li class="treeview">
      <a href="#">
        <i class="fa fa-folder-o"></i>
        <span>Files</span>
        <span class="pull-right-container">
          <i class="fa fa-angle-left fa-fw pull-right"></i>
        </span>
      </a>
      <ul class="treeview-menu">
        <li>
          <a href="#">
            <i class="fa fa-file-word-o"></i> Documents
          </a>
        </li>
        <li>
          <a href="#">
            <i class="fa fa-file-picture-o"></i> Images
          </a>
        </li>
        <li>
          <a href="#">
            <i class="fa fa-file-pdf-o"></i> PDFs
          </a>
        </li>
      </ul>
    </li>

    <li class="header">LOGS</li>
    <router-link tag="li" class="pageLink" to="/access">
      <a>
        <i class="fa fa-book"></i>
        <span class="page">Access</span>
      </a>
    </router-link>
    <router-link tag="li" class="pageLink" to="/server">
      <a>
        <i class="fa fa-hdd-o"></i>
        <span class="page">Server</span>
      </a>
    </router-link>
    <router-link tag="li" class="pageLink" to="/repos">
      <a>
        <i class="fa fa-heart"></i>
        <span class="page">Repos</span>
        <small class="label pull-right bg-green">AJAX</small>
      </a>
    </router-link>

    <li class="header">PAGES</li>
    <router-link tag="li" class="pageLink" to="/login">
      <a>
        <i class="fa fa-circle-o text-yellow"></i>
        <span class="page"> Login</span>
      </a>
    </router-link>
    <router-link tag="li" class="pageLink" to="/404">
      <a>
        <i class="fa fa-circle-o text-red"></i>
        <span class="page"> 404</span>
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
