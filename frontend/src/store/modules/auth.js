import generateMutations from '../utilities/generate-mutations'
import axios from 'axios'
import { wsClient } from '../../services'

const state = {
  user: {},
  scope: [],
  accessToken: '',
  refreshToken: ''
}

const mutations = generateMutations(state)

const actions = {
  updateTokens({ commit }, { accessToken, refreshToken }) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + accessToken
    wsClient.client.overrideReconnectionAuth({
      headers: { authorization: 'Bearer' + accessToken }
    })

    commit('SET_ACCESS_TOKEN', accessToken)
    commit('SET_REFRESH_TOKEN', refreshToken)

    console.debug('Tokens updated')
  },
  useRefreshToken({ state }) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + state.refreshToken
    wsClient.client.overrideReconnectionAuth({
      headers: { authorization: 'Bearer' + state.refreshToken }
    })

    console.debug('Using refresh token')
  },
  setAuth({ commit, dispatch }, data) {
    dispatch('updateTokens', data)
    commit('SET_SCOPE', data.scope)
    commit('SET_USER', data.user)

    wsClient.connect()
  },
  clearAuth({ commit, dispatch }) {
    axios.defaults.headers.common.Authorization = undefined

    commit('CLEAR_ACCESS_TOKEN')
    commit('CLEAR_REFRESH_TOKEN')
    commit('CLEAR_SCOPE')
    commit('CLEAR_USER')

    console.debug('Clearing auth')

    // dispatch('websocket/disconnect', null, { root: true })
    wsClient.disconnect()
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
