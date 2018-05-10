import vm from '../main'

const internals = {}

internals.updateDocument = function(document) {
  document = Object.assign({}, document)

  delete document.users
  delete document.scope
  delete document.owner

  return vm.$documentRepository.update(document._id, document)
}

internals.updateDocumentUsers = function(documentId, usersToInvite) {
  return vm.$documentRepository.addManyUsers(documentId, usersToInvite)
}

export default internals
