export function getLyric(song) {
  return uni.$u.http.get(`/system/dict/data/${id}`)
}

export function getSongUrl(song) {
  return uni.$u.http.post(`/api/fs/get`, { path: `${song.path}/${song.name}` })
}

export function uploadFile(song) {
  return uni.$u.http.post(`/api/fs/get`, { path: `${song.path}/${song.name}` })
}

export function getApiToken() {
  return uni.$u.http.post(`/api/auth/login`, { username: 'guest', password: 'guest' })
}

// 获取文件目录的递归函数
export async function listSong(path = '', depth = 1, result = []) {
  if (depth > 5) return result;  // 最大递归深度为 5

  try {
    // 请求文件列表
    const res = await uni.$u.http.post(`/api/fs/list`, { path });
    
    const files = res.data.content || []; // 假设返回的数据包含在 'data' 字段中
    
    for (let file of files) {
      const filePath = `${path}/${file.name}`;
      
      if (file.is_dir) {
        // 如果是目录，递归获取其内容
        await listSong(filePath, depth + 1, result);
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
export async function listAllSong(path) {
  let result = []
  try {
    result = await listSong(path, 1, []);  // 从根目录开始
    console.log('listAllSong', result);  // 输出所有非目录文件的路径
  } catch (error) {
    console.error('Error in getAllFiles:', error);
  }
  return result
}