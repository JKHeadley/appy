import Images from '../components/views/images/Images.vue'
import ImageCreate from '../components/views/images/ImageCreate.vue'

const routes = [
  {
    path: 'images',
    component: Images,
    name: 'Images',
    meta: { description: 'Your images', title: 'Images' }
  }, {
    path: '/images/create',
    component: ImageCreate,
    name: 'ImageCreate',
    meta: { description: 'Create a new image', title: 'Image' }
  }
]

export default routes
