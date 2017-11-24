import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
// import VuexPersistence from 'vuex-persist'
import auth from './modules/auth'

import state from './state'
import actions from './actions'
import mutations from './mutations'

Vue.use(Vuex)

// const vuexLocal = new VuexPersistence({
//   storage: window.localStorage
// })

export default new Vuex.Store({
  state,
  actions,
  mutations,
  modules: {
    auth
  },
  plugins: [createPersistedState()]
  // plugins: [vuexLocal.plugin]
})
