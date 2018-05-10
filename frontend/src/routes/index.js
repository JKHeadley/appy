import NotFound from '../components/404.vue'

import Login from '../components/views/login/Login.vue'
import LoginSocial from '../components/views/login/LoginSocial.vue'
import ForgotPassword from '../components/views/login/ForgotPassword.vue'
import ResetPassword from '../components/views/login/ResetPassword.vue'

import Register from '../components/views/register/Register.vue'
import ActivateAccount from '../components/views/register/ActivateAccount.vue'

import mainRoutes from './main.route'

const routes = [
  ...mainRoutes,
  {
    path: '/login',
    component: Login,
    name: 'Login',
    meta: { requiresUnauth: true }
  },
  {
    path: '/login/social',
    component: LoginSocial,
    name: 'LoginSocial',
    meta: { requiresUnauth: true }
  },
  {
    path: '/login/forgot',
    component: ForgotPassword,
    name: 'ForgotPassword',
    meta: { requiresUnauth: true }
  },
  {
    path: '/login/reset',
    component: ResetPassword,
    name: 'ResetPassword'
  },
  {
    path: '/activate',
    component: ActivateAccount,
    name: 'ActivateAccount'
  },
  {
    path: '/register',
    component: Register,
    name: 'Register',
    meta: { requiresUnauth: true }
  },
  {
    // not found handler
    path: '*',
    component: NotFound
  }
]

export default routes
