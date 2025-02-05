// 把校验方法挂载到 $u.test 对象上（重写或新增）

// 手机号
uni.$u.test.mobile = (str) => {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(str)
}
