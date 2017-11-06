import Vue from 'vue'
import axios from 'axios'
import { localStorage } from '../main'

export default (function () {
  // const localStorage = localStorage

  var session = {
    create: create,
    update: update,
    setUser: setUser,
    useRefreshToken: useRefreshToken,
    updateTokens: updateTokens,
    destroy: destroy
  }

  function create (obj) {
    delete obj.user.password
    delete obj.user.__v

    // add jwt token to auth header for all requests made by the http service
    axios.defaults.headers.common.Authorization = obj.authHeader

    // save vars to keep user logged in between page refreshes
    localStorage.set('session', {
      user: obj.user,
      role: obj.scope[0],
      scope: obj.scope,
      authHeader: obj.authHeader,
      refreshToken: obj.refreshToken
    })

    // set vars for session
    session.user = obj.user
    session.role = obj.scope[0]
    session.scope = obj.scope
    session.authHeader = obj.authHeader
    session.refreshToken = obj.refreshToken
    session.deprecated = false

    console.debug('Session created:\n', session)
  }

  function update () {
    // add jwt token to auth header for all requests made by the http service
    axios.defaults.headers.common.Authorization = localStorage.get('session').authHeader

    // set vars for session on page refresh
    session.user = localStorage.get('session').user
    session.role = localStorage.get('session').role
    session.scope = localStorage.get('session').scope
    session.authHeader = localStorage.get('session').authHeader
    session.refreshToken = localStorage.get('session').refreshToken
  }

  function setUser (user) {
    session.user = user
    localStorage.set('session', session)
  }

  function useRefreshToken () {
    session.authHeader = 'Bearer ' + session.refreshToken

    axios.defaults.headers.common.Authorization = session.authHeader
    localStorage.set('session', session)

    console.debug('Using refresh token')
  }

  function updateTokens (authHeader, refreshToken) {
    session.refreshToken = refreshToken
    session.authHeader = authHeader

    axios.defaults.headers.common.Authorization = session.authHeader
    localStorage.set('session', session)

    console.debug('Updated tokens')
  }

  function destroy () {
    console.debug('Session.destroy: clearing localstorage')
    // remove jwt token from header
    axios.defaults.headers.common.Authorization = ''
    // remove user from local storage and clear http auth header
    localStorage.remove('session')
    // unset session vars
    var session = {}
  }

  return session
})()
