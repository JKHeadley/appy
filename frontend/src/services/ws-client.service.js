import store from '../store'
import Nes from 'nes/lib/client'
import config, { RESPONSE_MESSAGES } from '../config'

const internals = {}

internals.client = new Nes.Client(config.websocketURI)

internals.connect = () => {
  internals.client.connect(
    {
      auth: {
        headers: { authorization: 'Bearer' + store.state.auth.accessToken }
      }
    },
    error => {
      if (error) {
        if (error.message === RESPONSE_MESSAGES.EXPIRED_ACCESS_TOKEN) {
          store.dispatch('auth/useRefreshToken')
          internals.client.disconnect()
          internals.client.connect(
            {
              auth: {
                headers: {
                  authorization: 'Bearer' + store.state.auth.refreshToken
                }
              }
            },
            error => {
              if (error) {
                console.error(error)
              }
            }
          )
        } else {
          console.error(error)
        }
      }
    }
  )

  internals.client.onError = err => {
    console.error('client ERROR:', err)
  }

  internals.client.onConnect = () => {
    console.log('CONNECTED:')
  }

  internals.client.onDisconnect = (willReconnect, log) => {
    console.log('DISCONNECTED:', willReconnect, log)
  }
}

internals.disconnect = () => {
  console.log('DISCONNECTING')
  internals.client.disconnect()
}

internals.request = options => {
  return new Promise((resolve, reject) => {
    internals.client.request(options, (error, payload, statusCode, headers) => {
      if (error) {
        if (error === RESPONSE_MESSAGES.EXPIRED_ACCESS_TOKEN) {
          store.dispatch('auth/useRefreshToken')
          return resolve(internals.request(options))
        } else {
          return reject(error)
        }
      } else {
        return resolve({ payload, statusCode, headers })
      }
    })
  })
}

internals.subscribe = (path, handler) => {
  console.log('CURRENT SUBSCRIPTIONS:', internals.client.subscriptions())
  return new Promise((resolve, reject) => {
    internals.client.subscribe(path, handler, error => {
      if (error) {
        return reject(error)
      } else {
        console.log('NEW SUBSCRIPTIONS:', internals.client.subscriptions())
        return resolve()
      }
    })
  })
}

export default internals
