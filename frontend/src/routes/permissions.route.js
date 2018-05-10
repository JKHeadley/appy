import Permissions from '../components/views/permissions/Permissions.vue'
import PermissionDetails from '../components/views/permissions/PermissionDetails.vue'
import PermissionCreate from '../components/views/permissions/PermissionCreate.vue'

const routes = [
  {
    path: 'permissions',
    component: Permissions,
    name: 'Permissions',
    meta: {
      description: 'List of appy permissions',
      title: 'Permissions',
      requiresAuth: true
    }
  },
  {
    path: '/permissions/:_id',
    beforeEnter: (to, from, next) => {
      to.params._id === 'create' ? next({ name: 'PermissionCreate' }) : next()
    },
    component: PermissionDetails,
    name: 'PermissionDetails',
    meta: {
      description: 'Details for the selected permission',
      title: 'Permission Details',
      requiresAuth: true
    }
  },
  {
    path: '/permission/create',
    component: PermissionCreate,
    name: 'PermissionCreate',
    meta: {
      description: 'Create a new permission',
      title: 'Permission Create',
      requiresAuth: true
    }
  }
]

export default routes
