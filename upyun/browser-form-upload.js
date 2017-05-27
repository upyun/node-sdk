import axios from 'axios'

export default async function formUpload (remoteUrl, localFile, {authorization, policy}) {
  const data = new FormData()
  data.append('authorization', authorization)
  data.append('policy', policy)
  data.append('file', localFile)
  const {status} = await axios.post(remoteUrl, data)
  return status === 200
}
