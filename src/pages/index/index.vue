<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input class="search-input" placeholder="关键字搜索音乐, 回车确认" v-model="searchQuery" @confirm="handleSearch"/>
      <view class="search-icon" v-show="searchQuery">
        <text class="iconfont icon-close" @click="clearSearch" />
      </view>
      <view class="search-icon">
        <text class="iconfont icon-search" @click="handleSearch" />
      </view>
    </view>
    <view class="search-tip">
      共{{ filteredMusicList.length }} / {{ musicList.length }} 首歌曲,
      <view class="sync-music" @click="syncMusic">强制同步</view>
    </view>

    <!-- 音乐列表 -->
    <view class="music-list">
      <view class="music-item" v-for="(item, index) in filteredMusicList" :key="index" :class="{ on: currentSong.name == item.name }" :id="`mitem-${index}`">
        <view class="music-info flex-1">
          <view class="music-title line-1">{{ item.name }}</view>
          <view class="music-artist line-1">{{ item.path }}</view>
        </view>
        <view class="music-actions">
          <text class="iconfont icon-play" @click="playMusic(item)" />
          <text class="iconfont icon-custom icon-add" @click="addToList(item)" />
        </view>
      </view>
    </view>

    <FloatTool :showTop="showBackToTop" @location="locationItem" />
  </view>
</template>

<script setup>
import { refreshToken } from '@/utils/storage';
import { usePlayer } from '@/store/player'
import { listAllSong } from '@/api/home';
import { isMusic } from '@/utils/index';

const playerStore = usePlayer()

const { currentSong } = storeToRefs(playerStore)

const searchQuery = ref('')
const musicList = ref([])
const filteredMusicList = ref([])
const showBackToTop = ref(false)

onPageScroll(e => {
  showBackToTop.value = e.scrollTop > 300
})

onLoad(async () => {
  await refreshToken()
  let songs = uni.getStorageSync('SONGS')
  if (!songs || !songs.length) {
    uni.showLoading({ title: '加载歌曲中...', mask: true, })
    songs = await listAllSong('/Music')
    uni.setStorageSync('SONGS', songs)
    uni.hideLoading()
  }
  musicList.value = songs.filter(item => isMusic(item.name))
  handleSearch()
})

function syncMusic() {
  uni.showModal({
    title: '提示',
    content: '确定要强制同步歌曲吗？这将会清空当前列表并重新加载所有歌曲。',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '加载歌曲中...', mask: true, })
        let songs = await listAllSong('/Music')
        musicList.value = songs.filter(item => isMusic(item.name))
        handleSearch()
        uni.hideLoading()
      }
    },
  })
}

function handleSearch() {
  filteredMusicList.value = musicList.value.filter(item => {
    return item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
           item.path.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
}

function clearSearch() {
  searchQuery.value = ''
  handleSearch()
}
    
function playMusic(item) {
  uni.showToast({
    title: `正在播放：${item.name}`,
    icon: 'none',
  });
  playerStore.addPlay(item, true)
}
    
function addToList(item) {
  uni.showToast({
    title: `已添加到我的音乐列表：${item.name}`,
    icon: 'none',
  });
  playerStore.addPlay(item, false)
}

function locationItem() {
  let ind = filteredMusicList.value.findIndex(item => `${item.path}${item.name}` === `${currentSong.value.path}${currentSong.value.name}`)
  document.getElementById(`mitem-${ind}`).scrollIntoView({ behavior: 'smooth',  block: 'center' });
}
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  padding: 4px 8px;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.search-input {
  flex: 1;
  padding: 0 8px;
  border: none;
  font-size: 14px;
  line-height: 52rpx;
}

.search-icon {
  margin-left: 10px;
  font-size: 18px;
  color: #333;
}
.icon-search {
  font-size: 20px;
}

.music-list {
  display: flex;
  flex-direction: column;
  padding-bottom: 60px;
}

.search-tip {
  text-align: right;
  font-size: 24rpx;
  color: #999;
}
.sync-music {
  color: #007aff;
  cursor: pointer;
  display: inline-block;
}
.back-to-top {
  position: fixed;
  right: 10px;
  bottom: 60px;
  width: 30px;
  height: 30px;
  background-color: #fff;
  color: white;
  border-radius: 50%;
  font-size: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  border: none;
  cursor: pointer;
  opacity: .8;
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
