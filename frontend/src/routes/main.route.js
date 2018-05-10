import Main from '../components/views/main/Main.vue'

import Dashboard from '../components/views/dashboard/Dashboard.vue'

import Profile from '../components/views/profile/Profile.vue'

import userRoutes from './users.route'
import roleRoutes from './roles.route'
import groupRoutes from './groups.route'
import permissionRoutes from './permissions.route'

import memberRoutes from './members.route'
import connectionRoutes from './connections.route'
import documentRoutes from './documents.route'
import imageRoutes from './images.route'

import auditLogRoutes from './audit-logs.route'

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
        meta: {
          description: 'Overview of app',
          title: 'Dashboard',
          requiresAuth: true
        }
      },
      {
        path: 'profile',
        component: Profile,
        name: 'Profile',
        meta: {
          description: 'Profile details',
          title: 'Profile',
          requiresAuth: true
        }
      },
      ...userRoutes,
      ...roleRoutes,
      ...groupRoutes,
      ...permissionRoutes,
      ...memberRoutes,
      ...connectionRoutes,
      ...documentRoutes,
      ...imageRoutes,
      ...auditLogRoutes
    ]
  }
]

export default routes
