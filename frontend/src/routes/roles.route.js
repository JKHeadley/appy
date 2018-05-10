import Roles from '../components/views/roles/Roles.vue'
import RoleDetails from '../components/views/roles/RoleDetails.vue'
import RoleCreate from '../components/views/roles/RoleCreate.vue'

const routes = [
  {
    path: 'roles',
    component: Roles,
    name: 'Roles',
    meta: {
      description: 'List of appy roles',
      title: 'Roles',
      requiresAuth: true
    }
  },
  {
    path: '/roles/:_id',
    beforeEnter: (to, from, next) => {
      to.params._id === 'create' ? next({ name: 'RoleCreate' }) : next()
    },
    component: RoleDetails,
    name: 'RoleDetails',
    meta: {
      description: 'Details for the selected role',
      title: 'Role Details',
      requiresAuth: true
    }
  },
  {
    path: '/roles/create',
    component: RoleCreate,
    name: 'RoleCreate',
    meta: {
      description: 'Create a new role',
      title: 'Role Create',
      requiresAuth: true
    }
  }
]

export default routes
