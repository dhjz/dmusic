## PageLoading 组件

在原 u-loadmore 组件上做了二次封装，传入分页信息和总数自动更新状态。

### 属性（Props）

| 属性名   | 类型   | 默认值    | 描述       |
| -------- | ------ | --------- | ---------- |
| pageSize | Number | 10        | 每页条数   |
| pageNum  | Number | 1         | 当前分页数 |
| total    | Number | undefined | 总数       |
| status   | String | 'loadmre' | 加载状态   |
