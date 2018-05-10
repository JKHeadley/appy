const ResourceHelper = function(httpClient, logger) {
  return {
    /**
     * Generate the CRUD methods for a resource.
     * @param resourceRoute: The API route for the resource.
     * @param options: Additional options to customize the caller.
     */
    generateCrudCallers: function(resourceRoute, options) {
      options = options || {}
      return {
        list: this.generateListCaller(resourceRoute, options),
        find: this.generateFindCaller(resourceRoute, options),
        update: this.generateUpdateCaller(resourceRoute, options),
        create: this.generateCreateCaller(resourceRoute, options),
        deleteOne: this.generateDeleteOneCaller(resourceRoute, options),
        deleteMany: this.generateDeleteManyCaller(resourceRoute, options)
      }
    },
    generateListCaller: function(resourceRoute, options) {
      return function(params) {
        logger.debug(resourceRoute + '.list + params: ', params)

        if (!params) {
          params = { isDeleted: false }
        } else if (!params.isDeleted) {
          params.isDeleted = false
        }

        if (options.filterDeleted === false) {
          delete params.isDeleted
        }

        return httpClient
          .get(resourceRoute, params)
          .then(function(response) {
            logger.debug(resourceRoute + '.list response:\n', response)
            return response
          })
          .catch(function(error) {
            logger.error(resourceRoute + '.list error:\n', error)
            throw error
          })
      }
    },
    generateFindCaller: function(resourceRoute, options) {
      return function(_id, params) {
        logger.debug(resourceRoute + '.find + _id: ', _id, ', params: ', params)

        return httpClient
          .get(resourceRoute + '/' + _id, params)
          .then(function(response) {
            logger.debug(resourceRoute + '.find response:\n', response)
            return response
          })
          .catch(function(error) {
            logger.error(resourceRoute + '.find error:\n', error)
            throw error
          })
      }
    },
    generateUpdateCaller: function(resourceRoute, options) {
      return function(_id, payload) {
        delete payload.createdAt
        delete payload.updatedAt
        delete payload.isDeleted
        logger.debug(
          resourceRoute + '.update + _id: ',
          _id,
          ', payload: ',
          payload
        )

        return httpClient
          .put(resourceRoute + '/' + _id, payload)
          .then(function(response) {
            logger.debug(resourceRoute + '.update response:\n', response)
            return response
          })
          .catch(function(error) {
            logger.error(resourceRoute + '.update error:\n', error)
            throw error
          })
      }
    },
    generateCreateCaller: function(resourceRoute, options) {
      return function(payload) {
        logger.debug(resourceRoute + '.create + payload: ', payload)

        return httpClient
          .post(resourceRoute, payload)
          .then(function(response) {
            logger.debug(resourceRoute + '.create response:\n', response)
            return response
          })
          .catch(function(error) {
            logger.error(resourceRoute + '.create error:\n', error)
            throw error
          })
      }
    },
    generateDeleteOneCaller: function(resourceRoute, options) {
      return function(_id, hardDelete) {
        hardDelete = hardDelete || false
        logger.debug(
          resourceRoute + '.deleteOne + _id: ',
          _id,
          ', hardDelete: ',
          hardDelete
        )

        return httpClient
          .delete(resourceRoute + '/' + _id, { hardDelete: hardDelete })
          .then(function(response) {
            logger.debug(resourceRoute + '.delete response:\n', response)
            return response
          })
          .catch(function(error) {
            logger.debug(resourceRoute + '.delete error:\n', error)
            throw error
          })
      }
    },
    generateDeleteManyCaller: function(resourceRoute, options) {
      return function(payload) {
        logger.debug(resourceRoute + '.deleteMany + payload', payload)

        return httpClient
          .delete(resourceRoute, payload)
          .then(function(response) {
            logger.debug(resourceRoute + '.delete response:\n', response)
            return response
          })
          .catch(function(error) {
            logger.debug(resourceRoute + '.delete error:\n', error)
            throw error
          })
      }
    },
    /**
     * Generate the association methods for a resource. The parameters are explained below with examples
     * using the context of a user and their shopping cart items.
     * @param ownerRoute: The API route for the owner resource,                    Ex: user
     * @param associationName: The name of the association for the owner resource, Ex: shoppingCartItems
     * @param associationRoute: The API route for the association,                 Ex: cart-item
     * childName: The name of the child/association resource,                      Ex: storeItem
     * @param options: Additional options to customize the caller.                Ex: cart-item
     *
     * The generated methods will correspond with the following routes:
     *
     * DELETE /user/{ownerId}/cart-item             Remove multiple storeItems from a user's list of shoppingCartItems
     * GET /user/{ownerId}/cart-item                Get all of the storeItems for a user
     * POST /user/{ownerId}/cart-item               Add multiple storeItems to a user's list of shoppingCartItems
     * DELETE /user/{ownerId}/cart-item/{childId}   Remove a single storeItem from a user's list of shoppingCartItems
     * PUT /user/{ownerId}/cart-item/{childId}      Add a single storeItem to a user's list of shoppingCartItems
     */
    generateAssociationCallers: function(
      ownerRoute,
      associationName,
      associationRoute,
      options
    ) {
      options = options || {}
      var resourceMethodName =
        associationName[0].toUpperCase() + associationName.slice(1)
      var callers = {}
      callers[
        'get' + resourceMethodName
      ] = this.generateGetAssociationsAssociationCaller(
        ownerRoute,
        associationRoute,
        resourceMethodName,
        options
      )
      callers[
        'addOne' + resourceMethodName
      ] = this.generateAddOneAssociationCaller(
        ownerRoute,
        associationRoute,
        resourceMethodName,
        options
      )
      callers[
        'removeOne' + resourceMethodName
      ] = this.generateRemoveOneAssociationCaller(
        ownerRoute,
        associationRoute,
        resourceMethodName,
        options
      )
      callers[
        'addMany' + resourceMethodName
      ] = this.generateAddManyAssociationCaller(
        ownerRoute,
        associationRoute,
        resourceMethodName,
        options
      )
      callers[
        'removeMany' + resourceMethodName
      ] = this.generateRemoveManyAssociationCaller(
        ownerRoute,
        associationRoute,
        resourceMethodName,
        options
      )

      return callers
    },
    generateGetAssociationsAssociationCaller: function(
      ownerRoute,
      associationRoute,
      resourceMethodName,
      options
    ) {
      return function(ownerId, params) {
        var methodName = ownerRoute + '.get' + resourceMethodName
        logger.debug(methodName + ' + ownerId: ', ownerId, ', params: ', params)

        if (!params) {
          params = { isDeleted: false }
        } else if (!params.isDeleted) {
          params.isDeleted = false
        }

        if (options.filterDeleted === false) {
          delete params.isDeleted
        }

        return httpClient
          .get(ownerRoute + '/' + ownerId + '/' + associationRoute, params)
          .then(function(response) {
            logger.debug(methodName + ' response:\n', response)
            return response
          })
          .catch(function(error) {
            logger.error(methodName + ' error:\n', error)
            throw error
          })
      }
    },
    generateAddOneAssociationCaller: function(
      ownerRoute,
      associationRoute,
      resourceMethodName,
      options
    ) {
      return function(ownerId, childId, payload) {
        var methodName = ownerRoute + '.addOne' + resourceMethodName
        logger.debug(
          methodName + ' + ownerId: ',
          ownerId,
          'childId: ',
          childId,
          ', payload: ',
          payload
        )

        return httpClient
          .put(
            ownerRoute + '/' + ownerId + '/' + associationRoute + '/' + childId,
            payload
          )
          .then(function(response) {
            logger.debug(methodName + ' response:\n', response)
            return response
          })
          .catch(function(error) {
            logger.error(methodName + ' error:\n', error)
            throw error
          })
      }
    },
    generateRemoveOneAssociationCaller: function(
      ownerRoute,
      associationRoute,
      resourceMethodName,
      options
    ) {
      return function(ownerId, childId) {
        var methodName = ownerRoute + '.removeOne' + resourceMethodName
        logger.debug(
          methodName + ' + ownerId: ',
          ownerId,
          'childResource: ',
          associationRoute,
          'childId: ',
          childId
        )

        return httpClient
          .delete(
            ownerRoute + '/' + ownerId + '/' + associationRoute + '/' + childId
          )
          .then(function(response) {
            logger.debug(methodName + ' response:\n', response)
            return response
          })
          .catch(function(error) {
            logger.error(methodName + ' error:\n', error)
            throw error
          })
      }
    },
    generateAddManyAssociationCaller: function(
      ownerRoute,
      associationRoute,
      resourceMethodName,
      options
    ) {
      return function(ownerId, payload) {
        var methodName = ownerRoute + '.addMany' + resourceMethodName
        logger.debug(
          methodName + ' + ownerId: ',
          ownerId,
          ', payload: ',
          payload
        )

        return httpClient
          .post(ownerRoute + '/' + ownerId + '/' + associationRoute, payload)
          .then(function(response) {
            logger.debug(methodName + ' response:\n', response)
            return response
          })
          .catch(function(error) {
            logger.error(methodName + ' error:\n', error)
            throw error
          })
      }
    },
    generateRemoveManyAssociationCaller: function(
      ownerRoute,
      associationRoute,
      resourceMethodName,
      options
    ) {
      return function(ownerId, payload) {
        var methodName = ownerRoute + '.removeMany' + resourceMethodName
        logger.debug(
          methodName + ' + ownerId: ',
          ownerId,
          ', payload: ',
          payload
        )

        return httpClient
          .delete(ownerRoute + '/' + ownerId + '/' + associationRoute, payload)
          .then(function(response) {
            logger.debug(methodName + ' response:\n', response)
            return response
          })
          .catch(function(error) {
            logger.error(methodName + ' error:\n', error)
            throw error
          })
      }
    }
  }
}

export default ResourceHelper
