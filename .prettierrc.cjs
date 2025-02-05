module.exports = {
  // 箭头函数只有一个参数时是否加括号 always avoid
  arrowParens: 'always',

  // 元素多行属性时右侧括号是否在同一行
  bracketSameLine: false,

  // 对象字面量赋值时花括号内首尾加空格
  bracketSpacing: true,

  // 是否格式化嵌入的代码 auto off
  embeddedLanguageFormatting: 'auto',

  // html 中空格是否敏感 css strict ignore
  htmlWhitespaceSensitivity: 'ignore',

  // 是否在文件顶部插入 @format 注释表明文件已被格式化过了
  insertPragma: false,

  // 在 jsx 中使用单引号
  jsxSingleQuote: true,

  // 单行代码最大长度，超出后自动换行
  printWidth: 120,

  // 文本折行 always never perserve
  proseWrap: 'preserve',

  // 属性加引号 as-needed consistent preserve
  quoteProps: 'as-needed',

  // 是否按照文件顶部特殊注释来格式化代码
  requirePragma: false,

  // 是否使用分号
  semi: false,

  // 是否使用单引号
  singleQuote: true,

  // 制表符 tab 的宽度
  tabWidth: 2,

  // 尾项是否使用逗号 none es5 all
  trailingComma: 'none',

  // 使用 tab 或空格缩进
  useTabs: false,

  // Vue 文件 script 和 style 标签是否缩进
  vueIndentScriptAndStyle: false
}
