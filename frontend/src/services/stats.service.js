import { httpClient as http } from '../services'
import vm from '../main'

const internals = {}

internals.getDashboardStats = () => {
  let promises = []

  // This function sometimes gets called before the global vm is ready
  if (vm) {
    promises.push(http.get('/stats/dashboard'))
    promises.push(vm.$visitorRepository.list())

    return Promise.all(promises).then(result => {
      let stats = result[0].data.stats
      stats.visitorData = result[1].data.docs
      return stats
    })
  } else {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(internals.getDashboardStats())
      }, 100)
    })
  }
}

internals.postVisit = () => {
  return http.post('visitor')
}

export default internals
