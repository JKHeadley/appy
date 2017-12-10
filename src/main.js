// Import ES6 Promise
import 'es6-promise/auto'

// Import global styles
import '../static/css/Custom.scss'
import 'vue-snotify/styles/material.css'

// Import System requirements
import Vue from 'vue'

import { sync } from 'vuex-router-sync'
import routes from './routes'
import store from './store'

import { httpClient, authInterceptor } from './services'

import axios from 'axios'
import qs from 'querystring'
import config, { resources } from './config'

// Import plugins
import VueRouter from 'vue-router'
import RestHapiRepository from './plugins/repository-plugin'
import Snotify, { SnotifyPosition } from 'vue-snotify'
import VueMoment from 'vue-moment'

// Import global components
import { ServerTable } from 'vue-tables-2'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import VueForm from 'vue-form'
import VueSelect from 'vue-select'
import VueFormInput from './components/utilities/VueFormInput.vue'
import ToggleButton from 'vue-js-toggle-button'
import VuePassword from 'vue-password/dist/custom'
import VueMaskedInput from 'vue-masked-input'

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
// Replace default serializer with one that works with Joi validation
axios.defaults.paramsSerializer = function (params) {
  return qs.stringify(params)
}

// Use plugins
Vue.use(VueRouter)
Vue.use(RestHapiRepository, { httpClient, resources, log: true })
Vue.use(ServerTable, {}, false)
Vue.use(VueForm, {
  inputClasses: {
    valid: 'form-control-success',
    invalid: 'form-control-danger'
  }
})
Vue.use(Snotify, {
  toast: {
    position: SnotifyPosition.rightTop
  }
})
Vue.use(ToggleButton)
Vue.use(VueMoment)

// Register global components
Vue.component('pulse-loader', PulseLoader)
Vue.component('vue-form-input', VueFormInput)
Vue.component('vue-select', VueSelect)
Vue.component('vue-password', VuePassword)
Vue.component('vue-masked-input', VueMaskedInput)

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

// Manage breadcrumbs
router.beforeEach((to, from, next) => {
  store.dispatch('setBreadcrumbs', { currentPath: to.path })
  next()
})

sync(store, router)

// Add a response interceptor
axios.interceptors.response.use(function (response) {
  return Promise.resolve(response)
}, authInterceptor.responseError)

// EXPL: Initialize auth header
axios.defaults.headers.common.Authorization = 'Bearer ' + store.state.auth.accessToken

// Start our app!
// eslint-disable-next-line no-new
const vm = new Vue({
  el: '#root',
  router: router,
  store: store,
  render: h => h(AppView)
})

export default vm
