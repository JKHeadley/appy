import store from '../store'
import axios from 'axios'
import { RESPONSE_MESSAGES } from '../config'

const internals = {}

internals.get = function (url, params) {
  return axios({
    method: 'GET',
    url: url,
    params: params
  })
    .then(function (response) {
      if (response.headers['x-access-token']) {
        internals.updateTokens(response.headers)
      }
      return response
    })
    .catch(function (error) {
      if (error === RESPONSE_MESSAGES.EXPIRED_ACCESS_TOKEN) {
        store.dispatch('auth/useRefreshToken')
        return internals.get(url, params)
      } else {
        throw error
      }
    })
}

internals.put = function (url, payload) {
  return axios({
    method: 'PUT',
    url: url,
    data: payload
  })
    .then(function (response) {
      if (response.headers['x-access-token']) {
        internals.updateTokens(response.headers)
      }
      return response
    })
    .catch(function (error) {
      if (error === RESPONSE_MESSAGES.EXPIRED_ACCESS_TOKEN) {
        store.dispatch('auth/useRefreshToken')
        return internals.put(url, payload)
      } else {
        throw error
      }
    })
}

internals.post = function (url, payload) {
  return axios({
    method: 'POST',
    url: url,
    data: payload
  })
    .then(function (response) {
      if (response.headers['x-access-token']) {
        internals.updateTokens(response.headers)
      }
      return response
    })
    .catch(function (error) {
      if (error === RESPONSE_MESSAGES.EXPIRED_ACCESS_TOKEN) {
        store.dispatch('auth/useRefreshToken')
        return internals.post(url, payload)
      } else {
        throw error
      }
    })
}

internals.delete = function (url, payload) {
  return axios({
    method: 'DELETE',
    url: url,
    data: payload
  })
    .then(function (response) {
      if (response.headers['x-access-token']) {
        internals.updateTokens(response.headers)
      }
      return response
    })
    .catch(function (error) {
      if (error === RESPONSE_MESSAGES.EXPIRED_ACCESS_TOKEN) {
        store.dispatch('auth/useRefreshToken')
        return internals.delete(url, payload)
      } else {
        throw error
      }
    })
}

internals.updateTokens = function (headers) {
  const tokens = {
    accessToken: headers['x-access-token'],
    refreshToken: headers['x-refresh-token']
  }
  store.dispatch('auth/updateTokens', tokens)
}

export default internals
