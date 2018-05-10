// Import ES6 Promise
import 'es6-promise/auto'

// Import global styles
// import '../static/css/imported/bootstrap.min.css'
import '../static/css/Custom.scss'
import 'vue-snotify/styles/material.css'
import 'vue-croppa/dist/vue-croppa.css'

// Import global js files
// import '../static/js/plugins/bootstrap/bootstrap.min'
// import 'jquery'

// Import System requirements
import Vue from 'vue'

import { sync } from 'vuex-router-sync'
import routes from './routes'
import store from './store'

import { httpClient, wsClient, authInterceptor, statsService } from './services'

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
import VueModal from 'vue-js-modal'
import ToggleButton from 'vue-js-toggle-button'
import VuePassword from 'vue-password/dist/custom'
import VueMaskedInput from 'vue-masked-input'
import Croppa from 'vue-croppa'
import Carousel3d from 'vue-carousel-3d'
import VueGridLayout from 'vue-grid-layout'
import VTooltip from 'v-tooltip'

import Box from './components/utilities/Box.vue'
import VueFormInput from './components/utilities/VueFormInput.vue'
import ChatBox from './components/utilities/ChatBox.vue'
import NewGroupChat from './components/utilities/NewGroupChat.vue'
import VueEditor from './components/utilities/VueEditor.vue'
import VistorMap from './components/utilities/VisitorMap.vue'

// Import global directives
import vPermission from './directives/v-permission'

// Import Helpers for filters
import {
  domain,
  count,
  prettyDate,
  pluralize,
  shortMessage,
  userList
} from './filters'

// Import Views - Top level
import AppView from './components/App.vue'

// Import Install and register helper items
Vue.filter('count', count)
Vue.filter('domain', domain)
Vue.filter('prettyDate', prettyDate)
Vue.filter('pluralize', pluralize)
Vue.filter('shortMessage', shortMessage)
Vue.filter('userList', userList)

axios.defaults.baseURL = config.serverURI

// Replace default serializer with one that works with Joi validation
axios.defaults.paramsSerializer = function(params) {
  return qs.stringify(params)
}

// Register global components and plugins
Vue.component('box', Box)
Vue.component('vue-form-input', VueFormInput)
Vue.component('chat-box', ChatBox)
Vue.component('new-group-chat', NewGroupChat)
Vue.component('vue-editor', VueEditor)
Vue.component('visitor-map', VistorMap)
Vue.component('pulse-loader', PulseLoader)
Vue.component('vue-select', VueSelect)
Vue.component('vue-password', VuePassword)
Vue.component('vue-masked-input', VueMaskedInput)
Vue.component('grid-layout', VueGridLayout.GridLayout)
Vue.component('grid-item', VueGridLayout.GridItem)
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
Vue.use(VueModal)
Vue.use(Croppa)
Vue.use(Carousel3d)
Vue.use(VTooltip)

// Register global directives
Vue.directive('permission', vPermission)

// Routing logic
var router = new VueRouter({
  routes: routes,
  mode: 'history',
  linkExactActiveClass: 'active',
  scrollBehavior: function(to, from, savedPosition) {
    return savedPosition || { x: 0, y: 0 }
  }
})

// Some middleware to help us ensure the user is authenticated.
router.beforeEach((to, from, next) => {
  if (
    to.matched.some(record => record.meta.requiresAuth) &&
    (!router.app.$store.state.auth.accessToken ||
      router.app.$store.state.auth.accessToken === 'null')
  ) {
    // This route requires auth, check if logged in
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

// Redirect authenticated users away from login views, etc.
router.beforeEach((to, from, next) => {
  if (
    to.matched.some(record => record.meta.requiresUnauth) &&
    router.app.$store.state.auth.accessToken
  ) {
    // Redirect authenticated users to the dashboard.
    window.console.log('Authenticated')
    next({
      path: '/dashboard'
    })
  } else {
    next()
  }
})

// Force users to update their password or PIN if needed.
// This mainly applies to users that have been invited to the system.
router.beforeEach((to, from, next) => {
  if (
    (store.state.auth.user.passwordUpdateRequired ||
      store.state.auth.user.pinUpdateRequired) &&
    to.fullPath !== '/profile?settings=true'
  ) {
    next({
      path: '/profile',
      query: { settings: true }
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

// Set up websockets
// store.dispatch('websocket/init')
if (store.state.auth.accessToken) {
  wsClient.connect()
}

// Add a response interceptor
axios.interceptors.response.use(function(response) {
  return Promise.resolve(response)
}, authInterceptor.responseError)

// Initialize auth header
axios.defaults.headers.common.Authorization =
  'Bearer ' + store.state.auth.accessToken

// Post to visitor endpoint to record visit
statsService.postVisit()

// Start our app!
// eslint-disable-next-line no-new
const vm = new Vue({
  el: '#root',
  router: router,
  store: store,
  render: h => h(AppView)
})

export default vm
