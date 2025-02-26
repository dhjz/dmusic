<script setup>
import { onLaunch, onUnload } from '@dcloudio/uni-app'
import { usePlayer } from '@/store/player'
import { getRandomIndexes, getTimeKey } from '@/utils/index'
import { PlayMode } from '@/utils/constants'
import Mousetrap from 'mousetrap';

let isInited = false;  // 是否初始化过
let lastPressTime = 0;  // 上次按键的时间
let pressCount = 0;     // 按键的次数
let pressTimer = null;
let currVolume = 0

const playerStore = usePlayer()
const { audio, onNext, onLoopPlay, onPrev, togglePlay } = playerStore
const {
  playing,
  currentTime,
  progressDragging,
  switching,
  currentSong,
  randomPlayIndexes,
  playList,
  playMode,
} = storeToRefs(playerStore)

onLaunch(() => {
  playerStore.backPlayList()
  setupAudio()
  // #ifdef APP-PLUS
  // initAppListenKey()
  // #endif
  // #ifdef H5
  initH5KeyBind()
  // #endif
})

/**
 * 监听audio事件
 */
function setupAudio() {
  audio.onCanplay(() => {
    console.log('onCanplay', audio);
    currentSong.value.dt = audio.duration * 1000
    if (!isInited) {
      const timeTemp = (uni.getStorageSync('CURR_TIME') || {})[getTimeKey(currentSong.value.name)] || 0
      console.log('timeTemp', timeTemp);
      if (timeTemp > 0 && timeTemp < audio.duration) {
        audio.seek(timeTemp)
      }
      isInited = true
    }
    audio.play()
  })

  audio.onPlay(() => {
    console.log('audio onPlay', audio);
    if (switching.value) return

    // 初始化播放时，如果是随机播放并且没有随机播放索引列表，则设置随机播放索引列表
    if (playMode.value === PlayMode.Random && !randomPlayIndexes.value.length) {
      randomPlayIndexes.value = getRandomIndexes(playList.value.length)
    }

    playing.value = true
  })

  audio.onPause(() => {
    console.log('audio onPause');
    playing.value = false
  })

  audio.onTimeUpdate(() => {
    if (progressDragging.value) return
    currentTime.value = audio.currentTime
    uni.setStorageSync('CURR_TIME', { [getTimeKey(currentSong.value.name)]: parseInt(audio.currentTime)} )
  })

  audio.onEnded(() => {
    // 判断是否循环播放
    playMode.value === PlayMode.Loop ? onLoopPlay() : onNext()
  })
}

function initH5KeyBind() {
  Mousetrap.bind(['command+left', 'ctrl+left'], () => onPrev());
  Mousetrap.bind(['command+right', 'ctrl+right'], () => onNext());
  Mousetrap.bind('space', () => {
    togglePlay()
    return false;// 阻止默认行为
  });
}

// 息屏了居然就没用了
function initAppListenKey() {
  currVolume = plus.device.getVolume()
  uni.showToast({ title: `开始监听系统音量按键, 双击上下曲`,  icon: 'none' });
  plus.key.addEventListener("volumeupbutton", volumeUp, false);
  plus.key.addEventListener("volumedownbutton", volumeDown, false);
}

function volumeUp(e) {
  pressCount++
  clearTimeout(pressTimer);
  plus.device.setVolume(currVolume)
  pressTimer = setTimeout(() => {
    if (pressCount == 1) {
      plus.device.setVolume(Math.min(currVolume + 0.08, 1))
    } else if (pressCount == 2) {
      onPrev()
      plus.device.setVolume(currVolume)
    } else if (pressCount == 3) {
      togglePlay()
      plus.device.setVolume(currVolume)
    }
    console.log({ title: `${pressCount}, ${plus.device.getVolume()}`,  icon: 'none' });
    pressCount = 0
    setTimeout(() =>  currVolume = plus.device.getVolume(), 60)
  }, 400)
}

function volumeDown(e) {
  pressCount++
  clearTimeout(pressTimer);
  plus.device.setVolume(currVolume)
  pressTimer = setTimeout(() => {
    if (pressCount == 1) {
      plus.device.setVolume(Math.max(currVolume - 0.06, 0))
    } else if (pressCount == 2) {
      onNext()
      plus.device.setVolume(currVolume)
    } else if (pressCount == 3) {
      togglePlay()
      plus.device.setVolume(currVolume)
    }
    console.log({ title: `${pressCount}, ${plus.device.getVolume()}`,  icon: 'none' });
    pressCount = 0
    setTimeout(() =>  currVolume = plus.device.getVolume(), 60)
  }, 400)
}

onUnload(() => {
  plus.key.removeEventListener("volumeupbutton", volumeUp);
  plus.key.removeEventListener("volumedownbutton", volumeDown);
})

</script>

<style lang="scss">
// @import 'uview-plus/index.scss';
@import "@/static/iconfont/iconfont.scss";
// @import './static/styles/quill-editor.scss';
</style>
