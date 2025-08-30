<template>
  <view v-if="visible" class="mask" @click="visible = false" @touchmove.prevent />
  <view class="curr-play-list" :class="{ 'visible': visible }">
    <view class="flex-center jc-sb">
      <view class="flex-center" @click="changePlayMode">
        <text class="iconfont" :class="modeIcon" />
        <text>{{ modeText }}</text>
        <text class="">
          ({{ playList.length }})
        </text>
      </view>
      <view class="flex-center">
        <text class="iconfont icon-delete" @click="onClear" />
      </view>
    </view>

    <scroll-view class="scroll-view" :scroll-y="true">
      <view class="music-list">
        <view v-for="(item, index) in playList" :key="index" class="music-item" :class="{ on: currentSong.name == item.name }">
          <view class="music-info flex-1" @dblclick="playMusic(item)">
            <view class="music-title line-1">{{ item.name }}</view>
            <view class="music-artist line-1">{{ item.path }} <span v-if="item.lrc">歌词</span></view>
          </view>
          <view class="music-actions">
            <text class="iconfont icon-play" @click="playMusic(item)" />
            <text class="iconfont icon-custom icon-minus" @click="delToList(item)" />
          </view>
        </view>
      </view>
      <view v-if="!playList || !playList.length" class="flex-center empty">暂无歌曲, 请到列表添加</view>
    </scroll-view>
  </view>
</template>

<script setup>
import { usePlayer } from '@/store/player'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits()

const playerStore = usePlayer()
const { changePlayMode, clearSongList } = playerStore
const { modeIcon, modeText, playList, currentSong } = storeToRefs(playerStore)

const visible = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

uni.$on('tabClick', () => (visible.value = false))

function playMusic(item) {
  uni.showToast({ title: `正在播放：${item.name}`, icon: 'none' })
  playerStore.addPlay(item, true)
}

function delToList(item) {
  uni.showToast({
    title: `已从我的音乐列表删除：${item.name}`,
    icon: 'none'
  })
  playerStore.delPlay(item)
}

async function onClear() {
  const { confirm } = await uni.showModal({
    content: '确定要清空播放列表吗？'
  })
  if (confirm) {
    clearSongList()
    visible.value = false
    emit('clearSuccess')
  }
}
</script>

<style lang="scss" scoped>
.mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
}
.curr-play-list {
  width: 100%;
  height: 70%;
  position: fixed;
  left: 0;
  bottom: 0;
  background-color: white;
  z-index: 999;
  transition: all 300ms;
  transform: translateY(100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
  border-radius: 10px 10px 0 0;
  &.visible {
    transform: translateY(0);
  }
}
.scroll-view {
  flex: 1;
  overflow: hidden;
  margin-top: 10px;
}
.empty {
  font-size: 16px;
  margin-top: 60px;
  color: #999;
}
</style>
