// Import ES6 Promise
import 'es6-promise/auto'

// Import System requirements
import Vue from 'vue'
import VueRouter from 'vue-router'
import VueLocalStorage from 'vue-ls'

import { sync } from 'vuex-router-sync'
import routes from './routes'
import store from './store'

import RestHapiRepository from './plugins/repository-plugin'
import httpClient from './services/http-client.service'
import authInterceptor from './services/auth-interceptor.service'

import axios from 'axios'
import config, { resources } from './config'

// Import Helpers for filters
import { domain, count, prettyDate, pluralize } from './filters'

// Import Views - Top level
import AppView from './components/App.vue'

// Import Install and register helper items
Vue.filter('count', count)
Vue.filter('domain', domain)
Vue.filter('prettyDate', prettyDate)
Vue.filter('pluralize', pluralize)

axios.defaults.baseURL = config.serverURI

Vue.use(VueRouter)
Vue.use(VueLocalStorage, { namespace: 'appy__' })
Vue.use(RestHapiRepository, { httpClient, resources })

// Routing logic
var router = new VueRouter({
  routes: routes,
  mode: 'history',
  linkExactActiveClass: 'active',
  scrollBehavior: function (to, from, savedPosition) {
    return savedPosition || { x: 0, y: 0 }
  }
})

// Some middleware to help us ensure the user is authenticated.
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth) && (!router.app.$store.state.token || router.app.$store.state.token === 'null')) {
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    window.console.log('Not authenticated')
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

sync(store, router)

// Check local storage to handle refreshes
var localUser = Vue.ls.get('user')

if (localUser && store.state.user !== localUser) {
  store.commit('SET_USER', localUser)
  store.commit('SET_TOKEN', Vue.ls.get('token'))
}

// Add a response interceptor
axios.interceptors.response.use(function (response) {
  // Do something with response error
  console.log('BAD PLACE')
  return Promise.resolve(response)
}, authInterceptor.responseError)

// Start out app!
// eslint-disable-next-line no-new
new Vue({
  el: '#root',
  router: router,
  store: store,
  render: h => h(AppView)
})

const localStorage = Vue.ls

export {
  router,
  localStorage
}
