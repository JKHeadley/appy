import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import generateMutations from './utilities/generate-mutations'

import auth from './modules/auth'

import state from './state'
import actions from './actions'
import mutations from './mutations'

Vue.use(Vuex)

export default new Vuex.Store({
  state,
  actions,
  mutations: Object.assign(mutations, generateMutations(state)),
  modules: {
    auth
  },
  plugins: [createPersistedState()]
})
