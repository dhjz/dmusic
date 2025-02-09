export function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

export function formatTime(time) {
  const minute = (`${(time / 60) | 0}`).padStart(2, '0')
  const second = (`${(time % 60) | 0}`).padStart(2, '0')
  return `${minute}:${second}`
}

export function throttle(fn, wait) {
  let lastTime = 0;  // 上次执行的时间

  return function (...args) {
      const now = new Date().getTime();  // 获取当前时间
      if (now - lastTime >= wait) {  // 判断是否达到执行间隔
          fn.apply(this, args);  // 执行传入的函数
          lastTime = now;  // 更新最后执行时间
      }
  };
}

export function toast(content) {
  uni.showToast({
    icon: 'none',
    title: content
  })
}

/**
* 参数处理
* @param params 参数
*/
export function tansParams(params) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName]
    var part = encodeURIComponent(propName) + "="
    if (value !== null && value !== "" && typeof (value) !== "undefined") {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== "" && typeof (value[key]) !== 'undefined') {
            let params = propName + '[' + key + ']'
            var subPart = encodeURIComponent(params) + "="
            result += subPart + encodeURIComponent(value[key]) + "&"
          }
        }
      } else {
        result += part + encodeURIComponent(value) + "&"
      }
    }
  }
  return result
}

/**
 * 根据数组长度随机生成索引
 * @param arrLength 数组的长度
 */
export function getRandomIndexes(arrLength) {
  const randomIndexes = []

  while (randomIndexes.length < arrLength) {
    const randomIndex = Math.floor(Math.random() * arrLength)

    // 确保没有重复的值且不等于当前索引
    if (!randomIndexes.includes(randomIndex)) {
      randomIndexes.push(randomIndex)
    }
  }

  return randomIndexes
}

export function isMusic(val) {
  // |wma 浏览器不支持
  return /\.(mp3|wav|aac|flac)$/i.test(val)
}

export function getFileName(val) {
  const ind = val.lastIndexOf('.');
    return ind === -1 ? val : val.slice(0, ind);
}

export const test1 = '88.'

export function goPage(url, type = 'navigate', timeout) {
  if (!url) return
  if (timeout) {
    setTimeout(() => goPageDo(url, type), timeout)
  } else {
    goPageDo(url, type)
  }
}

export function goPageDo(url, type = 'navigate') {
  if (!url) return
  if (!type) type = 'navigate'
  type = (type + '').toLowerCase()
  // 返回上n级, 负数自动转化为正
  if (Number.isInteger(url)) return uni.navigateBack({ delta: Math.abs(url) })
  // 跳转页面
  if (type === 'navigate' || type === 'navigateto') return uni.navigateTo({ url })
  // 重定向
  if (type === 'redirect' || type === 'redirectto') uni.redirectTo({ url })
  // 重新打开
  if (type === 'relaunch') uni.reLaunch({ url })
  // 重定向
  if (type === 'switch' || type === 'switchtab') uni.switchTab({ url })
}