import store from '../store'
import Vue from 'vue'

const internals = {}

/**
 * The 'v-permission' directive disables or removes an element if the current user does not have the permissions/scope
 * provided to the directive. The '.enable' modifier sets the element to disabled if the required conditions are not
 * met, and the '.if' modifier (or no modifier) will replace the element with a comment (remove the element) if the
 * required conditions are not met.
 *
 * The array of values provided to the directive are compared against the user's scope. The following rules apply:
 *
 * - Any value that contains a '+' prefix MUST be included in the user's scope, or the element will be hidden/disabled.
 * - If a value matches a forbidden permission in the user's scope (those with a '-' prefix), then the element will be
 *   hidden/disabled.
 * - The user's scope must contain at least one of the non-required values (those without a '+' prefix) if they exist,
 *   or the element will be hidden/disabled.
 *
 * Ex: v-permission.enable="['user', 'updateUser']" (the element is disabled if the current user's scope does not have
 * the 'user' or 'updateUser' values, or if the users's scope contains either '-user' or '-updateUser)
 *
 * Ex: v-permission.if="['+Admin', 'group', 'readGroup']" (the element is removed if the current user's scope does not
 * contain the value 'Admin' and at least one of 'group' or 'readGroup'. The element is also removed if the user's scope
 * contains any of '-Admin', '-group', or 'readGroup')
 */
internals.bind = (el, binding, vnode) => {
  const userScope = store.state.auth.scope
  const permissions = binding.value

  let forbidden = !!permissions.filter(
    permission => userScope.indexOf('-' + permission) > -1
  )[0]

  let requiredPermissions = permissions.filter(
    permission => permission[0] === '+'
  )

  let hasRequired = true
  if (requiredPermissions[0]) {
    hasRequired = !!userScope.filter(
      scope => requiredPermissions.indexOf('+' + scope) > -1
    )[0]
  }

  let hasPermission = !!userScope.filter(
    scope => permissions.indexOf(scope) > -1
  )[0]

  // Root users always have access
  if (userScope.indexOf('root') > -1) {
    hasPermission = true
    forbidden = false
    hasRequired = true
  }

  // Restrict access if the user does not have permission
  if (!hasPermission || !hasRequired || forbidden) {
    // '.enabled' disables the element if the user does not have permission
    if (binding.modifiers.enable) {
      el.disabled = true
      el.style.position = 'relative'

      const TooltipComponent = Vue.extend({
        template:
          '<span v-tooltip="\'Need Permissions\'" style="position: absolute; top: 0px; bottom: 0px; right: 0px; left: 0px;"></span>'
      })

      const tooltipComponent = new TooltipComponent().$mount()
      el.appendChild(tooltipComponent.$el)

      // '.if' removes the element if the user does not have permission
    } else {
      // Replace HTMLElement with comment node
      const comment = document.createComment(' ')
      Object.defineProperty(comment, 'setAttribute', {
        value: () => undefined
      })
      vnode.elm = comment
      vnode.text = ' '
      vnode.isComment = true
      vnode.context = undefined
      vnode.tag = undefined
      vnode.data.directives = undefined

      if (vnode.componentInstance) {
        vnode.componentInstance.$el = comment
      }

      if (el.parentNode) {
        el.parentNode.replaceChild(comment, el)
      }
    }
  }
}

export default internals
