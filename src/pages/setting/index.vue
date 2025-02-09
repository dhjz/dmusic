<template>
  <view class="container">
    <view class="form-item">
      <view class="label">
        <view @click="showSync">同步列表</view>
        <view>
          <view class="btn btn-mini" @click="syncUpload">上传</view>
          <view class="btn btn-mini" @click="syncDownload">下载</view>
        </view>
      </view>
      <input type="text" v-model="syncCode" placeholder="同步编码, 建议3-6位, 姓名首字母" />
    </view>
  </view>
</template>

<script setup>
import { isMusic, test1 } from '@/utils/index';
import { usePlayer } from '@/store/player'

const playerStore = usePlayer()

const syncCode = ref(uni.getStorageSync('syncCode') || '')

let count = 0
function showSync() {
  count++
  if (count == 5) {
    uni.showToast({ title: '已开启同步歌词' })
    uni.setStorageSync('syncLyric', true)
  }
}

async function syncUpload() {
  const { confirm } = await uni.showModal({
    content: '确定要上传并覆盖配置吗？',
  })
  if (!confirm) return 
  if (!syncCode.value || !syncCode.value.trim()) return uni.showToast({ title: '请输入同步编码' })
  uni.setStorageSync('syncCode', syncCode.value)
  const data = {}
  const playList = uni.getStorageSync('playList')
  const lyricTemp = uni.getStorageSync('lyricTemp')

  if (playList && playList.length) {
    data['playList'] = playList
  }
  if (lyricTemp && Object.keys(lyricTemp).length) {
    data['lyricTemp'] = lyricTemp
  }

  uni.request({
    url: 'https://f.199311.xyz/t',
    method: 'POST',
    data: JSON.stringify({
      type: 'put',
      key: 'dmusic:' + syncCode.value,
      val: JSON.stringify(data)
    }),
    success: ({ data, statusCode, header }) => {
      uni.showToast({ title: '上传成功', icon: 'success' })
    },
    fail: (error) => {}
  })
}


async function syncDownload() {
  const { confirm } = await uni.showModal({
    content: '确定要下载并覆盖配置吗？',
  })
  if (!confirm) return 
  uni.request({
    url: 'https://f.199311.xyz/t',
    method: 'POST',
    data: JSON.stringify({
      type: 'get',
      key: 'dmusic:' + syncCode.value,
    }),
    success: ({ data, statusCode, header }) => {
      if (data['playList'] && data['playList'].length) {
        uni.setStorageSync('playList', data['playList'])
        playerStore.backPlayList()
      }
      if (data['lyricTemp'] && Object.keys(data['lyricTemp']).length) {
        uni.setStorageSync('lyricTemp', data['lyricTemp'])
      }
      uni.showToast({ title: '下载成功', icon: 'success' })
    },
    fail: (error) => {}
  })
}

</script>

<style scoped lang="scss">
.container {
  padding: 10px;
}
</style>
