'use strict'

export function readBlock (localFile, blockId) {
  const blockSize = 1024 * 1024

  // File type
  const slice = localFile.slice || localFile.mozSlice || localFile.webkitSlice
  if (slice) {
    let start = blockSize * blockId
    let end = start + blockSize
    return slice.call(localFile, start, end)
  }
}

export default {
  readBlock
}
