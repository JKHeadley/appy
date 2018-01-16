import store from '../store'
import _ from 'lodash'

import vm from '../main'
import { httpClient as http } from '../services'

const internals = {}

internals.getConversationById = (conversationId) => {
  return http.get('/conversation/my', { conversation: conversationId })
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      console.error('chatService.getConversation-error:\n', error)
      throw error
    })
}

internals.getConversationByContacts = (userIds) => {
  return http.get('/conversation/my', { users: userIds })
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      console.error('chatService.getConversation-error:\n', error)
      throw error
    })
}

internals.getConversations = () => {
  return http.get('/conversations/my')
    .then((response) => {
      return response
    })
    .catch((error) => {
      console.error('chatService.getConversations-error:\n', error)
      throw error
    })
}

export default internals
