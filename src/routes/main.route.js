import Main from '../components/views/main/Main.vue'

import Dashboard from '../components/views/dashboard/Dashboard.vue'
import Tables from '../components/views/dashboard/Tables.vue'
import Tasks from '../components/views/dashboard/Tasks.vue'
import Setting from '../components/views/dashboard/Setting.vue'
import Access from '../components/views/dashboard/Access.vue'
import Server from '../components/views/dashboard/Server.vue'
import Repos from '../components/views/dashboard/Repos.vue'

import Profile from '../components/views/profile/Profile.vue'

import userRoutes from './users.route'
import roleRoutes from './roles.route'
import groupRoutes from './groups.route'
import permissionRoutes from './permissions.route'

const routes = [
  {
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
      },
      ...userRoutes,
      ...roleRoutes,
      ...groupRoutes,
      ...permissionRoutes
    ]
  }
]

export default routes
