import Documents from '../components/views/documents/Documents.vue'
import DocumentCreate from '../components/views/documents/DocumentCreate.vue'
import DocumentDetails from '../components/views/documents/DocumentDetails.vue'

const routes = [
  {
    path: 'documents',
    component: Documents,
    name: 'Documents',
    meta: {
      description: 'Your documents',
      title: 'Documents',
      requiresAuth: true
    }
  },
  {
    path: '/documents/:_id',
    beforeEnter: (to, from, next) => {
      to.params._id === 'create'
        ? next({ name: 'DocumentCreate', requiresAuth: true })
        : next()
    },
    component: DocumentDetails,
    name: 'DocumentDetails',
    props: route => ({ canEdit: route.query.canEdit }),
    meta: {
      description: 'Details for the selected document',
      title: 'Document Details',
      requiresAuth: true
    }
  },
  {
    path: '/documents/create',
    component: DocumentCreate,
    name: 'DocumentCreate',
    meta: {
      description: 'Create a new document',
      title: 'Document',
      requiresAuth: true
    }
  }
]

export default routes
