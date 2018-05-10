import { httpClient as http } from '../services'

const internals = {}

internals.getConversationById = conversationId => {
  return http
    .get('/conversation/my', { conversation: conversationId })
    .then(response => {
      return response.data
    })
    .catch(error => {
      console.error('chatService.getConversationById-error:\n', error)
      throw error
    })
}

internals.getConversationByUser = userId => {
  return http
    .get('/conversation/my', { user: userId })
    .then(response => {
      return response.data
    })
    .catch(error => {
      console.error('chatService.getConversationByContacts-error:\n', error)
      throw error
    })
}

internals.getConversations = () => {
  return http
    .get('/conversations/my')
    .then(response => {
      return response
    })
    .catch(error => {
      console.error('chatService.getConversations-error:\n', error)
      throw error
    })
}

internals.markAsRead = conversationId => {
  return http
    .put('/conversation/' + conversationId + '/read')
    .then(response => {
      return response
    })
    .catch(error => {
      console.error('chatService.markAsRead-error:\n', error)
      throw error
    })
}

internals.markAsUnread = conversationId => {
  return http
    .put('/conversation/' + conversationId + '/unread')
    .then(response => {
      return response
    })
    .catch(error => {
      console.error('chatService.markAsUnread-error:\n', error)
      throw error
    })
}

export default internals
