import { SYS_CONFIG } from "@/config"

// 请求拦截
const requestInterceptors = (vm) => {
  uni.$u.http.interceptors.request.use(
    (config) => {
      // 初始化请求拦截器时，会执行此方法，此时data为undefined，赋予默认{}
      config.data = config.data || {}

      if (config.custom.outside) return config

      const isToken = (config.header || {}).isToken === false
      const token = uni.getStorageSync('SESSION-TOKEN')

      if (token && !isToken) {
        config.header.Authorization = token
      }

      return config
    },
    (config) => Promise.reject(config)
  )
}

// 响应拦截
const responseInterceptors = (vm) => {
  uni.$u.http.interceptors.response.use(
    (response) => {
      const data = response.data
      const custom = response.config?.custom

      if (data.code !== 200) {
        if (custom.toast !== false) {
          uni.$u.toast(data.message)
        }

        if (custom?.catch) {
          return Promise.reject(data)
        } else {
          return new Promise(() => {})
        }
      }

      return data || {}
    },
    (response) => {
      return Promise.reject(response)
    }
  )
}

//  初始化请求配置
const initRequest = (vm) => {
  uni.$u.http.setConfig((defaultConfig) => {
    defaultConfig.baseURL = SYS_CONFIG.baseApi
    return defaultConfig
  })

  requestInterceptors()
  responseInterceptors()
}

const rawRequest = function (options = {}) {
  return new Promise((reso, rej) => {
    uni.request({
      success: function(res) {
        if (res.statusCode === 200) {
          reso(res.data)
        } else {
          rej(res)
        }
      },
      fail: function(err) {
        rej(err)
      },
      ...options,
    });
    
  })
}

export { initRequest, rawRequest }
