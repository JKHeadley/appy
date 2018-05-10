import vm from '../main'

export default {
  // Set a custom breadcrumb title for the current route
  setBreadcrumbTitle({ state, commit }, breadcrumbTitle) {
    const parts = vm.$router.currentRoute.path.split('/').slice(1)
    const breadcrumbs = state.breadcrumbs
    for (const [index] of parts.entries()) {
      let subPath = ''
      for (let i = 0; i <= index; i++) {
        subPath += '/' + parts[i]
      }
      if (subPath === vm.$router.currentRoute.path) {
        breadcrumbs[index].title = breadcrumbTitle
        commit('SET_BREADCRUMBS', breadcrumbs)
        return
      }
    }
  },
  setBreadcrumbs({ state, commit }, { currentPath }) {
    if (vm) {
      const parts = currentPath.split('/').slice(1)
      const breadcrumbs = []
      for (const [index] of parts.entries()) {
        let subPath = ''
        for (let i = 0; i <= index; i++) {
          subPath += '/' + parts[i]
        }
        // Use the current breadcrumb if it exists, else add the default breadcrumb
        let breadcrumb = state.breadcrumbs.find(breadcrumb => {
          return breadcrumb.path === subPath
        })
        if (!breadcrumb) {
          let { route } = vm.$router.resolve(subPath)
          breadcrumb = {
            path: subPath,
            title: route.meta.title
          }
        }
        breadcrumbs.push(breadcrumb)
      }
      commit('SET_BREADCRUMBS', breadcrumbs)
    }
  }
}
