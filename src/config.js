export const SYS_CONFIG = Object.assign({
  baseApi: 'http://home.199311.xyz:25244',
  musicDir: '/Local/Music',
  username: 'dhj',
  password: 'dhj',
}, uni.getStorageSync('SYS_CONFIG') || {})