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
    // not found handler
    path: '*',
    component: NotFound
  }
]

export default routes
