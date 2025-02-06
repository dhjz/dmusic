<template>
  <view class="wh-full" :class="{ 'full-screen': fullScreen }">
    <view class="music-title">{{ currName }}</view>
    <view class="music-path">{{ currentSong.path }}</view>
    <!-- 旋转的光盘 -->
    <view v-show="!isLyric" class="fade-in w-full flex-1 flex-center">
      <view class="music-pic">
        <view
          class="music-point" :class="{ 'stop': !playing }"
        >
          <image class="wh-full" src="@/static/stylus.png" />
        </view>

        <view
          class="wh-full relative rotate-start"
          :class="{ 'rotate-paused': !playing }"
          @click="isLyric = true"
        >
          <image class="wh-full music-img-bg" src="@/static/circle.png" />
          <image class="music-img" src="@/static/star.jpg" />
        </view>
      </view>
    </view>

    <!-- 歌词 -->
    <scroll-view
      v-show="isLyric"
      scroll-y
      scroll-with-animation
      :scroll-top="scrollTop"
      class="fade-in flex-1 lyric-box"
      :class="isLyric ? 'opacity-100' : 'opacity-0'"
      @click="isLyric = false"
    >
      <view v-if="lyricList && lyricList.length" class="pb-50%">
        <view
          v-for="(lyric, index) in lyricList"
          :key="lyric.time"
          :style="{ fontSize: fontSize + 'px' }"
          :class="{ 'on': index === currentLyricIndex }"
          class="text-center lyric-item"
        >
          {{ lyric.content }}
        </view>
      </view>
      <view v-else class="h-full flex-center text-sm text-light">
        暂无歌词
      </view>
    </scroll-view>
    <view class="lyric-control">
      <text class="iconfont icon-custom icon-add" @click="scaleLyric(true)" />
      <text class="iconfont icon-custom icon-minus" @click="scaleLyric(false)" />
      <text class="iconfont icon-custom icon-full" @click="fullScreen = !fullScreen" />
      <picker @change="lyricChange" :value="lyricInd" :range="lyrics" range-key="name">
				<text class="iconfont" v-show="lyrics && lyrics.length">↹</text>
      </picker>
    </view>
    <view class="w-full music-btm">
      <!-- 进度条 -->
      <view class="flex-center">
        <view >{{ formatTime(currentTime) }}</view>
        <view class="flex-1">
          <slider
            class="m0"
            background-color="rgba(0, 0, 0, 0.3)"
            active-color="var(--color-base)"
            :block-size="12"
            :value="progress"
            @change="onChange"
            @changing="onChanging"
          />
        </view>
        <view class="w-10 text-right">
          {{ formatTime(currentSong.dt / 1000) }}
        </view>
      </view>

      <!-- 歌曲操作栏 -->
      <view class="flex ai-c jc-sa music-control">
        <text class="iconfont" :class="modeIcon" @click="changePlayMode" />
        <text class="iconfont icon-prev" @click="onPrev" />
        <text
          class="iconfont"
          :class="playing ? 'icon-pause' : 'icon-play'"
          @click="togglePlay"
        />
        <text class="iconfont icon-next" @click="onNext" />
        <text class="iconfont icon-playlist" @click="visible = true" />
        <text class="iconfont " @click="copyUrl">♬</text>
      </view>
    </view>

    <curr-play-list v-model="visible" />
  </view>
</template>

<script setup>
import { formatTime } from '@/utils/index'
import { usePlayer } from '@/store/player'
import { useProgress } from './hooks/use-progress'
import { useLyric } from './hooks/use-lyric'

const playerStore = usePlayer()
const { togglePlay, onPrev, onNext, changePlayMode, fetchSongUrl } = playerStore
const { currentSong, playing, currentTime, modeIcon, currUrl } = storeToRefs(playerStore)
const { progress, onChanging, onChange } = useProgress()
const { isLyric, lyricList, currentLyricIndex, scrollTop, setSize, setLyricList, setLyricTemp  } = useLyric()
const { remoteLyrics } = storeToRefs(useLyric())

const lyricInd = ref(0)
const fullScreen = ref(false)
const visible = ref(false)
const fontSize = ref(uni.getStorageSync('lyricFontSize') || 14)
setSize(fontSize.value)

// 去掉后缀名
const currName = computed(() => (currentSong.value.name || '').split('.')[0])
const lyrics = computed(() => remoteLyrics.value.map(item => ({...item, name: `${item.title}-${item.artist}-${item.album}`})))


function scaleLyric(isAdd) {
  fontSize.value += isAdd ? 1 : -1
  setSize(fontSize.value)
  uni.setStorageSync('lyricFontSize', fontSize.value)
}

function copyUrl() {
  if (!currUrl.value) return uni.showToast({ title: '暂无播放链接, 请先播放歌曲', icon: 'none' })
  uni.setClipboardData({
    data: currUrl.value,
    success() {
      uni.showToast({ title: '复制链接成功', icon: 'none' })
    }
  })
}

function lyricChange(e) {
  const ind = e.detail.value
  setLyricList(lyrics.value[ind].lyrics)
  uni.showToast({ title: '切换歌词成功', icon: 'none' })
  setLyricTemp(currName.value, lyrics.value[ind].id)
}

</script>

<style scoped lang="scss">
@keyframes rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes heartbeat {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.3);
  }
}
@keyframes fadeIn {
  0%{
    opacity: 0;
  }
  100%{
    opacity: 1;
  }
}

.rotate-start{
  animation: rotate 20s linear infinite
}
.rotate-paused{
  animation-play-state: paused
}
.icon-collect-selected{
  @apply text-theme;
  animation: heartbeat 0.2s;
}
.fade-in{
  animation: fadeIn 0.8s;
}
.music-title {
  text-align: center;
  font-size: 20px;
  padding: 10px 0;
}
.music-path {
  text-align: center;
  font-size: 13px;
  color: #999;
}
.music-btm {
  position: absolute;
  bottom: 20rpx;
  left: 0;
  padding: 0 30rpx;
}
.music-control .iconfont {
  font-size: 46rpx;
}
.music-pic {
  position: relative;
  width: 540rpx;
  height: 540rpx;
  margin-top: 120rpx;
}
.music-img-bg {
  opacity: .9;
}
.music-img {
  width: 60%;
  height: 60%;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.music-point {
  width: 18.5%;
  height: 30%;
  position: absolute;
  left: 49%;
  top: -15px;
  z-index: 20;
  transform: rotate(-15deg);
  transform-origin: 12px 12px;
  transition: transform 0.3s;
  &.stop {
    transform: rotate(30deg);
  }
}
.lyric-box {
  position: relative;
  overflow: hidden;
  margin-top: 20px;
  width: 100%;
  font-size: 28rpx;
  height: calc(100vh - 240px);
}
.lyric-item {
  font-size: 14px;
  padding: 8px 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.1;
  &.on {
    transform: scale(1.1);
    color: var(--color-base);
  }
}
.lyric-control {
  position: fixed;
  top: 70px;
  right: 7px;
  .iconfont {
    margin-bottom: 6px;
    display: flex;
  }
}

.full-screen {
  .music-path {
    display: none;
  }
  .lyric-box {
    margin-top: 4px;
    height: calc(100vh - 100px);
  }
  .music-btm {
    display: none;
  }
  .lyric-control {
    bottom: 60px;
  }
}
</style>
