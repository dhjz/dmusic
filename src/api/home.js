import request from '@/utils/request';
import { SYS_CONFIG } from '@/config'

export function getLyric(song) {
  return request({
    url: `/system/dict/data/${id}`,
    method: 'post'
  })
}

export function getSongUrl(song) {
  return request({
    url: `/api/fs/get`,
    method: 'post',
    data: { path: `${song.path}/${song.name}` },
  })
}

export function getRawFile(path, params) { // params: { sign, alist_ts }
  return request({
    url: `${SYS_CONFIG.baseApi}/p${path}`,
    method: 'get',
    params
  })
}

export function getApiToken() {
  return request({
    url: `/api/auth/login`,
    method: 'post',
    data: { username: SYS_CONFIG.username, password: SYS_CONFIG.password },
  })
}

// 获取文件目录的递归函数
export async function listSong(path = '', depth = 1, result = [], isForce) {
  if (depth > 5) return result;  // 最大递归深度为 5

  try {
    // 请求文件列表
    let url = `/api/fs/list${isForce ? ('?t=' + new Date().getTime()) : ''}`
    const res = await request({ url, method: 'post',  data: { path }});
    
    const files = res.data.content || []; // 假设返回的数据包含在 'data' 字段中
    
    for (let file of files) {
      const filePath = `${path}/${file.name}`;
      
      if (file.is_dir) {
        // 如果是目录，递归获取其内容
        await listSong(filePath, depth + 1, result, isForce);
      } else {
        // 如果是文件，加入到结果中
        result.push({ name: file.name, path: path, is_dir: file.is_dir, size: file.size });
      }
    }
  } catch (error) {
    console.error('Error fetching files:', error);
  }

  return result;
}

// 调用函数并输出结果
export async function listAllSong(path, isForce) {
  let result = []
  try {
    result = await listSong(path, 1, [], isForce);  // 从根目录开始
    console.log('listAllSong', result);  // 输出所有非目录文件的路径
  } catch (error) {
    console.error('Error in getAllFiles:', error);
  }
  return result
}