import Documents from '../components/views/documents/Documents.vue'
import DocumentCreate from '../components/views/documents/DocumentCreate.vue'
import DocumentDetails from '../components/views/documents/DocumentDetails.vue'

const routes = [
  {
    path: 'documents',
    component: Documents,
    name: 'Documents',
    meta: { description: 'Your documents', title: 'Documents' }
  }, {
    path: '/documents/:_id',
    beforeEnter: (to, from, next) => {
      to.params._id === 'create' ? next({ name: 'DocumentCreate' }) : next()
    },
    component: DocumentDetails,
    name: 'DocumentDetails',
    meta: { description: 'Details for the selected document', title: 'Document Details' }
  }, {
    path: '/documents/create',
    component: DocumentCreate,
    name: 'DocumentCreate',
    meta: { description: 'Create a new document', title: 'Document' }
  }
]

export default routes
