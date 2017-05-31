import axios from 'axios'

export default function formUpload (remoteUrl, localFile, {authorization, policy}) {
  const data = new FormData()
  data.append('authorization', authorization)
  data.append('policy', policy)
  data.append('file', localFile)
  return axios.post(remoteUrl, data).then(({status}) => {
    return Promise.resolve(status === 200)
  })
}
