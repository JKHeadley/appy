import _ from 'lodash'

import vm from '../main'

const internals = {}

internals.updateDocument = function (newDocument) {
  newDocument = Object.assign({}, newDocument)

  delete newDocument.users
  delete newDocument.scope

  return vm.$documentRepository.update(newDocument._id, newDocument)
}

internals.updateDocumentUsers = function (documentId, usersToInvite) {
  return vm.$documentRepository.addManyUsers(documentId, usersToInvite)
}

export default internals
