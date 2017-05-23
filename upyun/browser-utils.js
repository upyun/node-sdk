'use strict'

export function readBlockAsync (localFile, start, end) {
  return new Promise((resolve, reject) => {
    const slice = localFile.slice || localFile.mozSlice || localFile.webkitSlice
    if (slice) {
      return resolve(slice.call(localFile, start, end))
    } else {
      return reject(new Error('not support File type!'))
    }
  })
}

export default {
  readBlockAsync
}
