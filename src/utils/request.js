import { toast, tansParams } from '@/utils/index'

let timeout = 30000
const baseUrl = import.meta.env.VITE_APP_BASE_API

const request = (config) => {
  config.header = config.header || {}
  if (uni.getStorageSync('SESSION-TOKEN') && !config.noToken) {
    config.header['Authorization'] = uni.getStorageSync('SESSION-TOKEN')
  }
  // get请求映射params参数
  if (config.params) {
    let url = config.url + '?' + tansParams(config.params)
    url = url.slice(0, -1)
    config.url = url
  }
  return new Promise((resolve, reject) => {
    uni.request({
      method: config.method || 'get',
      timeout: config.timeout || timeout,
      url: config.url.startsWith('http') ? config.url : (baseUrl + config.url),
      data: config.data,
      header: config.header,
      // dataType: 'json',
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data || {})
        } else {
          toast('后端接口' + res.statusCode + '异常')
          reject('后端接口' + res.statusCode + '异常')
        }
      },
      fail: (err) => {
        console.log(err)
        toast('后端接口请求错误')
        reject(err)
      },
    })
  })
}

export default request
