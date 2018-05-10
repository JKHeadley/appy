import Groups from '../components/views/groups/Groups.vue'
import GroupDetails from '../components/views/groups/GroupDetails.vue'
import GroupCreate from '../components/views/groups/GroupCreate.vue'

const routes = [
  {
    path: 'groups',
    component: Groups,
    name: 'Groups',
    meta: {
      description: 'List of appy groups',
      title: 'Groups',
      requiresAuth: true
    }
  },
  {
    path: '/groups/:_id',
    beforeEnter: (to, from, next) => {
      to.params._id === 'create' ? next({ name: 'GroupCreate' }) : next()
    },
    component: GroupDetails,
    name: 'GroupDetails',
    meta: {
      description: 'Details for the selected group',
      title: 'Group Details',
      requiresAuth: true
    }
  },
  {
    path: '/groups/create',
    component: GroupCreate,
    name: 'GroupCreate',
    meta: {
      description: 'Create a new group',
      title: 'Group Create',
      requiresAuth: true
    }
  }
]

export default routes
