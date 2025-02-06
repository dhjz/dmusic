export function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

export function formatTime(time) {
  const minute = (`${(time / 60) | 0}`).padStart(2, '0')
  const second = (`${(time % 60) | 0}`).padStart(2, '0')
  return `${minute}:${second}`
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