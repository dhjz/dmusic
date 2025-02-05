<template>
  <view class="page-content">
    <PageLoading :loading="loading" />

    <view :style="loading ? 'visibility:hidden' : ''">
      <u-image src="@/static/images/tabbar/my.png" />

      <RichText :html="detail.content" />

      <RichEditor v-model="detail.content" />

      <FileUpload v-model="detail.file" />

      <u-button type="primary" @click="addCount">按钮</u-button>
      <view>{{ counter.count }}</view>
    </view>
  </view>
</template>

<script setup>
import { useCounterStore } from '@/store/counter'
const counter = useCounterStore()

const loading = ref(false)

const data = reactive({
  detail: {
    content: '<p>123214</p>'
  }
})

const { detail } = toRefs(data)

function addCount() {
  counter.count++
}
</script>

<style lang="scss" scoped>
// 注意嵌套和换行
</style>
