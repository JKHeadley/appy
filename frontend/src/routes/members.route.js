import Members from '../components/views/members/Members.vue'
import MemberProfile from '../components/views/members/MemberProfile.vue'

const routes = [
  {
    path: 'members',
    component: Members,
    name: 'Members',
    meta: {
      description: 'List of appy members',
      title: 'Members',
      requiresAuth: true
    }
  },
  {
    path: '/members/:_id',
    beforeEnter: (to, from, next) => {
      to.params._id === 'create' ? next({ name: 'MemberCreate' }) : next()
    },
    component: MemberProfile,
    name: 'MemberProfile',
    meta: {
      description: 'Profile for the selected member',
      title: 'Member Profile',
      requiresAuth: true
    }
  }
]

export default routes
