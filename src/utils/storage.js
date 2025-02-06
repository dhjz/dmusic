/**
 * @Author: Mojie
 * @Date: 2023-07-13 22:22:57
 */

import { PlayMode, CacheType } from '@/utils/constants'
import { getApiToken } from '@/api/home';


/**
 * 获取播放模式
 */
export function getPlayMode() {
  return uni.getStorageSync(CacheType.PlayModeKey)
}

/**
 * 设置播放模式
 * @param mode
 */
export function setPlayMode(mode) {
  uni.setStorageSync(CacheType.PlayModeKey, mode)
}

/**
 * 获取搜索历史列表
 */
export function getSearchHistory() {
  return uni.getStorageSync(CacheType.SearchHistory) || []
}

/**
 * 设置搜索历史列表
 * @param keywords 关键字
 */
export function setSearchHistory(keywords) {
  uni.setStorageSync(CacheType.SearchHistory, keywords)
}

/**
 * 清除搜索历史列表
 */
export function clearSearchHistory() {
  uni.removeStorageSync(CacheType.SearchHistory)
}


// 获取本地存储的 token
export async function refreshToken() {
  const token = uni.getStorageSync('SESSION-TOKEN');
  const timestamp = uni.getStorageSync('token_timestamp');
  console.log(token, timestamp);

  const currentTime = new Date().getTime();
  const expiryTime = 24 * 60 * 60 * 1000; // 24 小时，单位是毫秒

  if (token && timestamp && (currentTime - timestamp < expiryTime)) {
    return token; 
  } else {
    let res = await getApiToken();
    const newToken = res.data.token;
    uni.setStorageSync('SESSION-TOKEN', newToken);
    uni.setStorageSync('token_timestamp', new Date().getTime());
    console.log(uni.getStorageSync('SESSION-TOKEN'), uni.getStorageSync('token_timestamp'));
    return newToken;
  }
}