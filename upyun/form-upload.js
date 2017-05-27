import FormData from 'form-data'

export default function formUpload (remoteUrl, localFile, {authorization, policy}) {
  return new Promise((resolve, reject) => {
    const data = new FormData()
    data.append('authorization', authorization)
    data.append('policy', policy)
    data.append('file', localFile)
    data.submit(remoteUrl, (err, res) => {
      if (err) {
        return reject(err)
      }

      return resolve(res.statusCode === 200)
    })
  })
}
