import Main from './components/views/main/Main.vue'
import NotFound from './components/404.vue'

import Login from './components/views/login/Login.vue'
import LoginSocial from './components/views/login/LoginSocial.vue'
import ForgotPassword from './components/views/login/ForgotPassword.vue'
import ResetPassword from './components/views/login/ResetPassword.vue'

// Imports - Dash
import Dashboard from './components/views/dashboard/Dashboard.vue'
import Tables from './components/views/dashboard/Tables.vue'
import Tasks from './components/views/dashboard/Tasks.vue'
import Setting from './components/views/dashboard/Setting.vue'
import Access from './components/views/dashboard/Access.vue'
import Server from './components/views/dashboard/Server.vue'
import Repos from './components/views/dashboard/Repos.vue'

import Profile from './components/views/profile/Profile.vue'

import Register from './components/views/register/Register.vue'
import ActivateAccount from './components/views/register/ActivateAccount.vue'

import Users from './components/views/users/Users.vue'
import UserDetails from './components/views/users/UserDetails.vue'
import UserCreate from './components/views/users/UserCreate.vue'

import Roles from './components/views/roles/Roles.vue'
import RoleDetails from './components/views/roles/RoleDetails.vue'
import RoleCreate from './components/views/roles/RoleCreate.vue'

import Groups from './components/views/groups/Groups.vue'
import GroupDetails from './components/views/groups/GroupDetails.vue'
import GroupCreate from './components/views/groups/GroupCreate.vue'

import Permissions from './components/views/permissions/Permissions.vue'
import PermissionDetails from './components/views/permissions/PermissionDetails.vue'
import PermissionCreate from './components/views/permissions/PermissionCreate.vue'

// Routes
const routes = [
  {
    path: '/login',
    component: Login,
    name: 'Login'
  }, {
    path: '/login/social',
    component: LoginSocial,
    name: 'LoginSocial'
  }, {
    path: '/login/forgot',
    component: ForgotPassword,
    name: 'ForgotPassword'
  }, {
    path: '/login/reset',
    component: ResetPassword,
    name: 'ResetPassword'
  }, {
    path: '/activate',
    component: ActivateAccount,
    name: 'ActivateAccount'
  }, {
    path: '/register',
    component: Register,
    name: 'Register'
  }, {
    path: '/',
    component: Main,
    children: [
      {
        path: 'dashboard',
        alias: '',
        component: Dashboard,
        name: 'Dashboard',
        meta: { description: 'Overview of environment', title: 'Dashboard' }
      }, {
        path: 'tables',
        component: Tables,
        name: 'Tables',
        meta: {description: 'Simple and advance table in CoPilot'}
      }, {
        path: 'tasks',
        component: Tasks,
        name: 'Tasks',
        meta: {description: 'Tasks page in the form of a timeline'}
      }, {
        path: 'setting',
        component: Setting,
        name: 'Settings',
        meta: {description: 'User settings page'}
      }, {
        path: 'access',
        component: Access,
        name: 'Access',
        meta: {description: 'Example of using maps'}
      }, {
        path: 'server',
        component: Server,
        name: 'Servers',
        meta: {description: 'List of our servers', requiresAuth: true}
      }, {
        path: 'repos',
        component: Repos,
        name: 'Repository',
        meta: {description: 'List of popular javascript repos'}
      }, {
        path: 'profile',
        component: Profile,
        name: 'Profile',
        meta: { description: 'Profile details', title: 'Profile' }
      }, {
        path: 'users',
        component: Users,
        name: 'Users',
        meta: { description: 'List of appy users', title: 'Users' }
      }, {
        path: '/users/:_id',
        beforeEnter: (to, from, next) => {
          to.params._id === 'create' ? next({ name: 'UserCreate' }) : next()
        },
        component: UserDetails,
        name: 'UserDetails',
        meta: { description: 'Details for the selected user', title: 'User Details' }
      }, {
        path: '/users/create',
        component: UserCreate,
        name: 'UserCreate',
        meta: { description: 'Create a new user', title: 'User Create' }
      }, {
        path: 'roles',
        component: Roles,
        name: 'Roles',
        meta: { description: 'List of appy roles', title: 'Roles' }
      }, {
        path: '/roles/:_id',
        beforeEnter: (to, from, next) => {
          to.params._id === 'create' ? next({ name: 'RoleCreate' }) : next()
        },
        component: RoleDetails,
        name: 'RoleDetails',
        meta: { description: 'Details for the selected role', title: 'Role Details' }
      }, {
        path: '/role/create',
        component: RoleCreate,
        name: 'RoleCreate',
        meta: { description: 'Create a new role', title: 'Role Create' }
      }, {
        path: 'groups',
        component: Groups,
        name: 'Groups',
        meta: { description: 'List of appy groups', title: 'Groups' }
      }, {
        path: '/groups/:_id',
        beforeEnter: (to, from, next) => {
          to.params._id === 'create' ? next({ name: 'GroupCreate' }) : next()
        },
        component: GroupDetails,
        name: 'GroupDetails',
        meta: { description: 'Details for the selected group', title: 'Group Details' }
      }, {
        path: '/group/create',
        component: GroupCreate,
        name: 'GroupCreate',
        meta: { description: 'Create a new group', title: 'Group Create' }
      }, {
        path: 'permissions',
        component: Permissions,
        name: 'Permissions',
        meta: { description: 'List of appy permissions', title: 'Permissions' }
      }, {
        path: '/permissions/:_id',
        beforeEnter: (to, from, next) => {
          to.params._id === 'create' ? next({ name: 'PermissionCreate' }) : next()
        },
        component: PermissionDetails,
        name: 'PermissionDetails',
        meta: { description: 'Details for the selected permission', title: 'Permission Details' }
      }, {
        path: '/permission/create',
        component: PermissionCreate,
        name: 'PermissionCreate',
        meta: { description: 'Create a new permission', title: 'Permission Create' }
      }
    ]
  }, {
    // not found handler
    path: '*',
    component: NotFound
  }
]

export default routes
