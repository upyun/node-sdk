declare class Service {
  constructor(serviceName: string, operatorName = '', password = ''): void
}

interface bodySign {
  authorization: string,
  policy: string
}

declare function getBodySign(service: Service, params: any): Promise<bodySign>

declare enum Order {
  desc,
  asc,
}

declare interface file {
  name: string,
  type: string,
  size: number,
  time: number,
}

declare interface filesAndNext {
  files: Array<file>,
  next: string
}

declare interface putFileOpts {
  'content-md5'?: string,
  'content-length'?: number,
  'content-type'?: string,
  'content-secret'?: string,
  'x-gmkerl-thumb'?: string
}

declare interface initMultipartUploadOpts {
  'content-type'?: string,
  'content-md5'?: string,
  'x-upyun-multi-type'?: string,
  'x-upyun-meta-x'?: string,
  'x-upyun-meta-ttl'?: string,
}

declare interface initMultipartUploadResult {
  fileSize: number,
  partCount: number,
  uuid: string,
}

declare interface headFileResult {
  'x-upyun-file-type'?: string,
  'x-upyun-file-size'?: number,
  'x-upyun-file-date'?: number,
  'Content-Md5'?: number
}

declare const stream: any

declare enum metadataOperate {
  merge,
  replace,
  delete,
}

declare interface metadata {
  [propName: string]: string|number|boolean,
}

declare interface blockUploadOpts extends metadata {
  'content-md5'?: string,
  'x-upyun-multi-type'?: string,
  'x-upyun-multi-ttl'?: string,
}

declare interface formPutFileOpts {
  filename?: string,
}

declare class Upyun {
  constructor (service: Service, param: {}, getHeaderSign: null): void

  setService(service: Service): void

  setBucket(bucket: Service): void

  setBodySignCallback(getBodySign: getBodySign): void

  usage(path = '/'): Promise<number>

  listDir(path = '/', {limit = 100, order: Order = 'asc'}): Promise<filesAndNext>

  putFile(remotePath: string, localFile: any, options: putFileOpts = {}): Promise<boolean>

  initMultipartUpload(remotePath: string, fileOrPath: any, options: initMultipartUploadOpts = {}): Promise<boolean | initMultipartUploadResult>

  multipartUpload(remotePath: string, fileOrPath: any, multiUuid: string, partId: number): Promise<boolean>

  completeMultipartUpload(remotePath: string, multiUuid: string): Promise<boolean>

  makeDir(remotePath: string): Promise<boolean>

  headFile(remotePath: string): Promise<boolean|headFileResult>

  deleteFile(remotePath: string, isAsync: boolean = false): Promise<boolean>

  deleteDir(remotePath: string, isAsync: boolean = false): Promise<boolean>

  getFile(remotePath: string, saveStream: any = null): Promise<boolean|string|stream>

  updateMetadata(remotePath: string, metas: metadata, operate: metadataOperate = 'merge'): Promise<boolean>

  getMetadata(remotePath: string): Promise<boolean|metadata>

  blockUpload(remotePath: stirng, fileOrPath: any, options: blockUploadOpts): Promise<boolean>

  formPutFile(remotePath: string, localFile: any, originParams: any, opts: formPutFileOpts): Promise<any>

  purge(urls: string[] | string): Promise<boolean>
}

interface getHeaderSignResult {
  'Authorization': string,
  'X-Date': string,
}

declare function getHeaderSign(service: Service, method: string, path: string, contentMd5: string | null = null): getHeaderSignResult

interface genSignOpts {
  'method': string,
  'path': string,
  'date'?: string,
  'policy'?: string,
  'contentMd5'?: string,
}

function genSign(service: Service, options: genSignOpts): string


declare interface getPolicyAndAuthorizationParams {
  [propName: string]: string|number|boolean,
}


declare interface getPolicyAndAuthorizationResult {
  policy: string,
  authorization: string,
}

function getPolicyAndAuthorization(service: Service, params: getPolicyAndAuthorizationParams): getPolicyAndAuthorizationResult

declare interface getPurgeHeaderSign {
  'Authorization': string,
  'Date': string,
  'User-Agent': string,
}

function getPurgeHeaderSign(service: Service, urls: string[]): getPurgeHeaderSign


function formUpload(remoteUrl: string, localFile: any, bodySign: bodySign, opts: {filename?: string} = {}): Promise<boolean|any>

function readBlockAsync(localFile: any, start: number, end: number): Promise<any>

declare const PARTSIZE: number

declare const isBrowser: boolean

declare function createReq(endpoint: string, service: Service, getHeaderSign: getHeaderSign, opts: {proxy?: any} = {}): any

declare function getFileSizeAsync(filePath: string): Promise<number>

declare function getContentType(filePath: string): boolean|string