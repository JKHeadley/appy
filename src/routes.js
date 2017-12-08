import MainView from './components/views/main/Main.vue'
import LoginView from './components/views/login/Login.vue'
import NotFoundView from './components/404.vue'

// Import Views - Dash
import DashboardView from './components/views/dashboard/Dashboard.vue'
import TablesView from './components/views/dashboard/Tables.vue'
import TasksView from './components/views/dashboard/Tasks.vue'
import SettingView from './components/views/dashboard/Setting.vue'
import AccessView from './components/views/dashboard/Access.vue'
import ServerView from './components/views/dashboard/Server.vue'
import ReposView from './components/views/dashboard/Repos.vue'

import ActivateAccountView from './components/views/register/ActivateAccount.vue'

import UsersView from './components/views/users/Users.vue'
import UserDetailsView from './components/views/users/UserDetails.vue'
import UserCreateView from './components/views/users/UserCreate.vue'

// Routes
const routes = [
  {
    path: '/login',
    component: LoginView
  },
  {
    path: '/activate',
    component: ActivateAccountView
  },
  {
    path: '/',
    component: MainView,
    children: [
      {
        path: 'dashboard',
        alias: '',
        component: DashboardView,
        name: 'Dashboard',
        meta: { description: 'Overview of environment', title: 'Dashboard' }
      }, {
        path: 'tables',
        component: TablesView,
        name: 'Tables',
        meta: {description: 'Simple and advance table in CoPilot'}
      }, {
        path: 'tasks',
        component: TasksView,
        name: 'Tasks',
        meta: {description: 'Tasks page in the form of a timeline'}
      }, {
        path: 'setting',
        component: SettingView,
        name: 'Settings',
        meta: {description: 'User settings page'}
      }, {
        path: 'access',
        component: AccessView,
        name: 'Access',
        meta: {description: 'Example of using maps'}
      }, {
        path: 'server',
        component: ServerView,
        name: 'Servers',
        meta: {description: 'List of our servers', requiresAuth: true}
      }, {
        path: 'repos',
        component: ReposView,
        name: 'Repository',
        meta: {description: 'List of popular javascript repos'}
      }, {
        path: 'users',
        component: UsersView,
        name: 'Users',
        meta: { description: 'List of appy users', title: 'Users' }
      }, {
        path: '/users/:_id',
        beforeEnter: (to, from, next) => {
          to.params._id === 'create' ? next({ name: 'UserCreate' }) : next()
        },
        component: UserDetailsView,
        name: 'UserDetails',
        meta: { description: 'Details for the selected user', title: 'User Details' }
      }, {
        path: '/users/create',
        component: UserCreateView,
        name: 'UserCreate',
        meta: { description: 'Create a new user', title: 'User Create' }
      }
    ]
  }, {
    // not found handler
    path: '*',
    component: NotFoundView
  }
]

export default routes
