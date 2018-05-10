import Users from '../components/views/users/Users.vue'
import UserDetails from '../components/views/users/UserDetails.vue'
import UserCreate from '../components/views/users/UserCreate.vue'

const routes = [
  {
    path: 'users',
    component: Users,
    name: 'Users',
    meta: {
      description: 'List of appy users',
      title: 'Users',
      requiresAuth: true
    }
  },
  {
    path: '/users/:_id',
    beforeEnter: (to, from, next) => {
      to.params._id === 'create' ? next({ name: 'UserCreate' }) : next()
    },
    component: UserDetails,
    name: 'UserDetails',
    meta: {
      description: 'Details for the selected user',
      title: 'User Details',
      requiresAuth: true
    }
  },
  {
    path: '/users/create',
    component: UserCreate,
    name: 'UserCreate',
    meta: {
      description: 'Create a new user',
      title: 'User Create',
      requiresAuth: true
    }
  }
]

export default routes
