import FormData from 'form-data'
import path from 'path'

export default function formUpload (remoteUrl, localFile, {authorization, policy}, {filename} = {}) {
  return new Promise((resolve, reject) => {
    const data = new FormData()
    data.append('authorization', authorization)
    data.append('policy', policy)
    // NOTE when type of localFile is buffer/string,
    // force set filename=file, FormData will treat it as a file
    // real filename will be set by save-key in policy
    filename = (filename || localFile.name || localFile.path) ?
      path.basename(filename || localFile.name || localFile.path) :
      'file'

    data.append('file', localFile, {
      filename: filename
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
