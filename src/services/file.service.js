import { httpClient as http } from '../services'

const internals = {}

internals.uploadProfileImage = (name, file, options) => {
  let data = new FormData()
  data.append('name', name)
  data.append('file', file)
  return http.post('/file/upload/profile-image', data, options)
}

export default internals
