import store from '../store'
import Vue from 'vue'

const internals = {}

internals.bind = (el, binding, vnode) => {
  const userScope = store.state.auth.scope
  const requiredPermissions = binding.value

  let hasPermission = !!userScope.filter(scope => requiredPermissions.indexOf(scope) > -1)[0]

  let forbidden = !!requiredPermissions.filter(permission => userScope.indexOf('-' + permission) > -1)[0]

  if (userScope.indexOf('root') > -1) {
    hasPermission = true
    forbidden = false
  }

  // EXPL: Restrict access if the user does not have permission
  if (!hasPermission || forbidden) {
    // EXPL: '.enabled' disables the element if the user does not have permission
    if (binding.modifiers.enable) {
      el.disabled = true
      el.style.position = 'relative'

      const TooltipComponent = Vue.extend({
        template: '<span v-tooltip="\'Need Permissions\'" style="position: absolute; top: 0px; bottom: 0px; right: 0px; left: 0px;"></span>'
      })

      const tooltipComponent = new TooltipComponent().$mount()
      el.appendChild(tooltipComponent.$el)

      // EXPL: '.if' removes the element if the user does not have permission
    } else {
      // EXPL: Replace HTMLElement with comment node
      const comment = document.createComment(' ')
      Object.defineProperty(comment, 'setAttribute', {
        value: () => undefined,
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
