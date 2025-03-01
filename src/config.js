export const SYS_CONFIG = Object.assign({
  baseApi: 'http://test.alist:25244', // http://test.alist:25244
  musicDir: '/Local/Music',
  username: '',
  password: '',
}, uni.getStorageSync('SYS_CONFIG') || {})