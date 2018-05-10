import changeCase from 'change-case'
import _ from 'lodash'

const generateMutations = function(initialState) {
  const mutations = {}

  for (const prop in initialState) {
    mutations['SET_' + changeCase.constantCase(prop)] = function(state, data) {
      state[prop] = data
    }

    mutations['DELETE_' + changeCase.constantCase(prop)] = function(state) {
      state[prop] = null
    }

    mutations['CLEAR_' + changeCase.constantCase(prop)] = function(state) {
      if (_.isString(state[prop])) {
        state[prop] = ''
      }
      if (_.isObject(state[prop])) {
        state[prop] = {}
      }
      if (_.isArray(state[prop])) {
        state[prop] = []
      }
      if (_.isBoolean(state[prop])) {
        state[prop] = false
      }
      if (_.isNumber(state[prop])) {
        state[prop] = 0
      }
    }

    if (_.isArray(initialState[prop])) {
      mutations['ADD_' + changeCase.constantCase(prop)] = function(
        state,
        data
      ) {
        state[prop].push(data)
      }

      mutations['REMOVE_' + changeCase.constantCase(prop)] = function(
        state,
        data
      ) {
        const index = state[prop].indexOf(data)

        if (index !== -1) {
          state[prop].splice(index, 1)
        }
      }
    }
  }

  return mutations
}

export default generateMutations
