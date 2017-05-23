'use strict'

import fs from 'fs'
import mime from 'mime-types'

export function readBlockAsync (filePath, start, end) {
  const size = end - start
  const b = makeBuffer(size)
  return new Promise((resolve, reject) => {
    fs.open(filePath, 'r', (err, fd) => {
      if (err) {
        return reject(err)
      }

      fs.read(fd, b, 0, size, start, (err, bytesRead, buffer) => {
        if (err) {
          return reject(err)
        }

        return resolve(buffer)
      })
    })
  })
}

function makeBuffer (size) {
  if (Buffer.alloc) {
    return Buffer.alloc(size)
  } else {
    const b = new Buffer(size)
    b.fill(0)
    return b
  }
}

export function getFileSizeAsync (filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stat) => {
      if (err) return reject(err)

      return resolve(stat.size)
    })
  })
}

export function getContentType (filePath) {
  return mime.lookup(filePath)
}

export default {
  readBlockAsync,
  getFileSizeAsync,
  getContentType
}
