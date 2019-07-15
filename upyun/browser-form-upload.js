import axios from 'axios'

export default function formUpload (remoteUrl, localFile, {authorization, policy}, {filename} = {}) {
  const data = new FormData()
  data.append('authorization', authorization)
  data.append('policy', policy)
  if (typeof localFile === 'string') {
    localFile = new Blob([localFile], {type: 'text/plain'})
  }

  data.append('file', localFile, filename)
  return axios.post(remoteUrl, data).then(({status, data}) => {
    if (status === 200) {
      return Promise.resolve(data)
    }

    return false
  })
}
