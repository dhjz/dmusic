<template>
  <view>
    <view class="float-tool">
      <view class="float-item back-to-top" v-if="showTop" @click="scrollToTop"></view>
      <view class="float-item" @click="visible = true"><text class="iconfont icon-playlist" /></view>
      <view class="float-item" v-show="showLoc" @click="$emit('location')">@</view>
    </view>
    <curr-play-list v-model="visible" />
  </view>
</template>

<script setup>

const props = defineProps({
  showTop: {
    type: Boolean,
    default: false
  }
})

const { proxy } = getCurrentInstance()

console.log(proxy);

const showLoc = proxy.$attrs && proxy.$attrs.onLocation


const visible = ref(false)

function scrollToTop() {
  // 使用 scrollTo 方法滚动到顶部
  uni.pageScrollTo({ scrollTop: 0, duration: 300, });
}

</script>

<style scoped lang="scss">
.float-tool {
  position: fixed;
  right: 10px;
  bottom: 60px;
}
.float-item{
  margin-top: 10px;
  width: 30px;
  height: 30px;
  background-color: #fff;
  color: #666;
  border-radius: 50%;
  font-size: 22rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  border: none;
  cursor: pointer;
  opacity: .8;
}
.back-to-top {
  &:before {
    content: "";
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 8px 10px 8px;
    border-color: transparent transparent #999 transparent;
  }
}
</style>
