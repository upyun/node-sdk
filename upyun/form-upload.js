import FormData from 'form-data'

export default function formUpload (remoteUrl, localFile, {authorization, policy}) {
  return new Promise((resolve, reject) => {
    const data = new FormData()
    data.append('authorization', authorization)
    data.append('policy', policy)
    // NOTE when type of localFile is buffer/string,
    // force set filename=file, FormData will treat it as a file
    // real filename will be set by save-key in policy
    data.append('file', localFile, {
      filename: 'file'
    })
    data.submit(remoteUrl, (err, res) => {
      if (err) {
        return reject(err)
      }

      if (res.statusCode !== 200) {
        return resolve(false)
      }

      let body = []
      res.on('data', (chunk) => {
        body.push(chunk)
      })
      res.on('end', () => {
        body = Buffer.concat(body).toString('utf8')
        try {
          const data = JSON.parse(body)
          return resolve(data)
        } catch (err) {
          return reject(err)
        }
      })

      res.on('error', (err) => {
        reject(err)
      })
    })
  })
}
