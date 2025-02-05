<template>
  <view>
    <!-- 加载更多 -->
    <u-loadmore v-if="total !== 0" v-show="pageNum !== 1" line margin-bottom="0" margin-top="40rpx" :status="status" />

    <!-- 暂无数据 -->
    <!-- <view v-if="total === 0" class="empty-tip">
      <u-image height="520rpx" src="@/static/images/img-empty.png" width="750rpx" />
      <view class="text">暂无内容</view>
    </view> -->
  </view>
</template>

<script setup>
const props = defineProps({
  pageNum: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  total: {
    type: Number,
    default: undefined
  },
  status: {
    type: String,
    default: 'loadmore'
  }
})

const pages = computed(() => {
  return Math.ceil(this.total / this.pageSize)
})

watch(props.pageNum, (val) => {
  if (val > pages) {
    this.$emit('updateStatus', 'nomore')
  } else {
    this.$emit('updateStatus', 'loadmore')
  }
})
</script>

<style lang="scss" scoped>
.empty-tip {
  padding-top: 120rpx;
  text-align: center;

  .text {
    font-size: 36rpx;
    font-family: PingFang SC-Semibold, PingFang SC;
    font-weight: 600;
    color: #010c0a;
    line-height: 42rpx;
  }
}
</style>
