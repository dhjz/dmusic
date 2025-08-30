<template>
  <view class="container">
    <view class="form-item">
      <view class="label">
        <view @click="showSync">同步列表</view>
      </view>
      <input v-model="syncCode" placeholder="同步编码, 建议3-6位, 姓名首字母" type="text" />
    </view>
    <view class="form-item">
      <view class="btn" @click="syncUpload">上传</view>
      <view class="btn" @click="syncDownload">下载</view>
    </view>
    <view class="hr" />
    <view class="form-item">
      <view class="label">alist地址</view>
      <input v-model="configs.baseApi" placeholder="alist地址, http://ip:port" type="text" />
    </view>
    <view class="form-item">
      <view class="label">音乐路径</view>
      <input v-model="configs.musicDir" placeholder="音乐根路径, /Local/Music" type="text" />
    </view>
    <view class="form-item">
      <view class="label">用户名</view>
      <input v-model="configs.username" placeholder="用户名" type="text" />
    </view>
    <view class="form-item">
      <view class="label">密码</view>
      <input v-model="configs.password" placeholder="密码" type="text" />
    </view>
    <view class="form-item">
      <view class="btn" @click="saveConfigs">保存</view>
    </view>
  </view>
</template>

<script setup>
import { usePlayer } from '@/store/player'
import { SYS_CONFIG } from '@/config'

const playerStore = usePlayer()

const syncCode = ref(uni.getStorageSync('syncCode') || '')

const configs = ref({ ...SYS_CONFIG })

async function saveConfigs() {
  const { confirm } = await uni.showModal({ content: '确定要覆盖配置并重载吗？' })
  if (!confirm) return
  uni.removeStorageSync('token_timestamp')
  uni.removeStorageSync('SESSION-TOKEN')
  uni.removeStorageSync('SONGS')
  uni.removeStorageSync('playList')
  uni.removeStorageSync('SINGERS')
  Object.assign(SYS_CONFIG, configs.value)
  uni.setStorageSync('SYS_CONFIG', configs.value)
  // #ifdef H5
  uni.reLaunch({ url: '/pages/index/index' })
  // #endif
  // #ifdef APP-PLUS
  plus.runtime.restart()
  // #endif
}

let count = 0
function showSync() {
  count++
  if (count == 5) {
    uni.showToast({ title: '已开启同步歌词' })
    uni.setStorageSync('syncLyric', true)
  }
}

async function syncUpload() {
  const { confirm } = await uni.showModal({ content: '确定要上传并覆盖配置吗？' })
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
    url: '',
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
    content: '确定要下载并覆盖配置吗？'
  })
  if (!confirm) return
  uni.setStorageSync('syncCode', syncCode.value)
  uni.request({
    url: '',
    method: 'POST',
    data: JSON.stringify({
      type: 'get',
      key: 'dmusic:' + syncCode.value
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
