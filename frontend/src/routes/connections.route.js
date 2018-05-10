import Connections from '../components/views/connections/Connections.vue'

const routes = [
  {
    path: 'connections',
    component: Connections,
    name: 'Connections',
    meta: {
      description: 'Users connected to you',
      title: 'Connections',
      requiresAuth: true
    }
  }
]

export default routes
