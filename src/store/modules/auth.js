import generateMutations from '../utilities/generate-mutations'
import axios from 'axios'

const state = {
  user: {},
  scope: [],
  accessToken: '',
  refreshToken: ''
}

const mutations = generateMutations(state)

const actions = {
  login ({ dispatch }, credentials) {
    return axios({
      method: 'POST',
      url: 'login',
      data: credentials
    })
      .then(function (response) {
        dispatch('setAuth', response.data)
      })
      .catch(function (error) {
        console.error('authAction.login-error:\n', error)
        throw error
      })
  },
  updateTokens ({ commit }, { accessToken, refreshToken }) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + accessToken

    commit('SET_ACCESS_TOKEN', accessToken)
    commit('SET_REFRESH_TOKEN', refreshToken)

    console.debug('Tokens updated')
  },
  useRefreshToken ({ state }) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + state.refreshToken

    console.debug('Using refresh token')
  },
  setAuth ({ commit, dispatch }, data) {
    dispatch('updateTokens', data)
    commit('SET_SCOPE', data.scope)
    commit('SET_USER', data.user)
  },
  clearAuth ({ commit }) {
    axios.defaults.headers.common.Authorization = undefined

    commit('CLEAR_ACCESS_TOKEN')
    commit('CLEAR_REFRESH_TOKEN')
    commit('CLEAR_SCOPE')
    commit('CLEAR_USER')

    console.debug('Clearing auth')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
