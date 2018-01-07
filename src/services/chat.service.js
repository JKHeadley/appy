import store from '../store'
import _ from 'lodash'

import vm from '../main'
import { httpClient as http } from '../services'

const internals = {}

internals.getConversation = (userId) => {
  return http.get('/conversation/my', { users: [userId] })
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      console.error('chatService.getConversation-error:\n', error)
      throw error
    })
}

export default internals
