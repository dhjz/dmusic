<template>
  <view class="container pts">
    <!-- 搜索栏 -->
    <view class="search-wrap">
      <view class="search-bar">
        <input class="search-input" placeholder="关键字搜索音乐, 回车确认" v-model="searchQuery" @confirm="handleSearch"/>
        <view class="search-icon" v-show="searchQuery">
          <text class="iconfont icon-close" @click="clearSearch" />
        </view>
        <view class="search-icon">
          <text class="iconfont icon-search" @click="handleSearch" />
        </view>
        <view class="search-icon" v-if="singers && singers.length" @click="showSinger = !showSinger">
          <image src="@/static/images/list.png"/>
        </view>
      </view>
    </view>
    <view class="singers-box" v-if="showSinger">
      <view class="singer-item" v-for="(item, index) in singers" :key="index" @click="chooseSinger(item)">{{ item }}</view>
    </view>
    <view class="search-tip flex jc-sb ai-c" v-if="isLogin">
      <view>
        <view class="btn" @click="$goPage('/pages/setting/index')">设置</view>
      </view>
      <view>
        共{{ filteredMusicList.length }} / {{ musicList.length }} 首歌曲,
        <view class="sync-music" @click="syncMusic">强制同步</view>
      </view>
    </view>

    <!-- 音乐列表 -->
    <view class="music-list" v-if="isLogin">
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
      <view class="text-center" v-if="!filteredMusicList || !filteredMusicList.length">暂无音乐</view>
    </view>

    <FloatTool :showTop="showBackToTop" @location="locationItem" v-show="isLogin" />

    <view v-if="!isLogin" class="login-wrap flex-center">
      <input type="text" v-model="pwd" placeholder="输入密码, 回车确认" @confirm="login">
    </view>
  </view>
</template>

<script setup>
import { refreshToken } from '@/utils/storage';
import { usePlayer } from '@/store/player'
import { listAllSong, getRawFile, getSongUrl } from '@/api/home';
import { isMusic, test1 } from '@/utils/index';

const playerStore = usePlayer()

const { currentSong } = storeToRefs(playerStore)

const test = '88'

const isLogin = ref((uni.getStorageSync('pwd') || '') === (test + test1))
const searchQuery = ref('')
const musicList = ref([])
const filteredMusicList = ref([])
const singers = ref([])
const showBackToTop = ref(false)
const showSinger = ref(false)
const pwd = ref('')

onPageScroll(e => {
  showBackToTop.value = e.scrollTop > 300
})

onLoad(async () => {
  if (!isLogin.value) return
  await refreshToken()
  let songs = uni.getStorageSync('SONGS')
  if (!songs || !songs.length) {
    uni.showLoading({ title: '加载歌曲中...初次加载较慢, 请稍后', mask: true, })
    songs = await listAllSong('/Music')
    uni.setStorageSync('SONGS', songs)
    uni.hideLoading()
  }
  musicList.value = songs.filter(item => isMusic(item.name))
  handleSearch()
  initSearch()
})

function syncMusic() {
  if (!isLogin.value) return
  uni.showModal({
    title: '提示',
    content: '确定要强制同步歌曲吗？这将会清空当前列表并重新加载所有歌曲。',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '加载歌曲中...', mask: true, })
        let songs = await listAllSong('/Music', true)
        musicList.value = songs.filter(item => isMusic(item.name))
        uni.setStorageSync('SONGS', songs)
        handleSearch()
        uni.hideLoading()
      }
    },
  })
}

async function initSearch() {
  let searchFile = { path: '/Music', name: 'search.json' }
  const { data } = await getSongUrl(searchFile)
  if (!data || !data.raw_url) return
  const res = await getRawFile(`${searchFile.path}/${searchFile.name}`, { sign: data.sign, alist_ts: Date.now()  })
  console.log(res);
  if (res.singers && res.singers.length) {
    singers.value = res.singers
  }
}

function chooseSinger(singer) {
  searchQuery.value = singer
  handleSearch()
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
  uni.pageScrollTo({ selector: `#mitem-${ind}` })
  // document.getElementById(`mitem-${ind}`).scrollIntoView({ behavior: 'smooth',  block: 'center' });
}

function login() {
  if (pwd.value === (test + test1)) {
    uni.setStorageSync('pwd', pwd.value)
    uni.reLaunch({ url: '/pages/index/index' })
  } else {
    uni.showToast({ title: '密码错误, 请重新输入' })
  }
}

</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  padding: 10px;
}
.search-wrap {
  padding-top: 10px;
}
.search-bar {
  display: flex;
  align-items: center;
  
  margin-bottom: 10px;
  
}

.search-input {
  flex: 1;
  
}

.search-icon {
  margin-left: 10px;
  font-size: 18px;
  color: #333;
  display: flex;
  align-items: center;
  image {
    width: 18px;
    height: 18px;
  }
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
  margin-bottom: 6px;
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
.login-wrap {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.6);
  input {
    background: #fff;
    border-radius: 10px;
    padding: 0 10px;
    line-height: 40px;
    height: 40px;
  }
}
.singers-box {
  margin: 0px 0;
}
.singer-item {
  margin: 0 4px 6px 0;
  font-size: 12px;
  border: 1px solid #ccc;
  padding: 0 6px;
  border-radius: 4px;
  display: inline-block;
  line-height: 18px;
}
</style>
