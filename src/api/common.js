// 字典数据详情
export function getDicts(dictCode) {
  return uni.$u.http.get(`/system/dict/data/${dictCode}`)
}
