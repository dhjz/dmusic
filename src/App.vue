<script setup>
import { onLaunch } from '@dcloudio/uni-app'
import { usePlayer } from '@/store/player'
import { getRandomIndexes } from '@/utils/index'
import { PlayMode } from '@/utils/constants'

const playerStore = usePlayer()
const { audio, onNext, onLoopPlay } = playerStore
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
})

/**
 * 监听audio事件
 */
function setupAudio() {
  audio.onCanplay(() => {
    console.log('onCanplay', audio);
    currentSong.value.dt = audio.duration * 1000
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
  })

  audio.onEnded(() => {
    // 判断是否循环播放
    playMode.value === PlayMode.Loop ? onLoopPlay() : onNext()
  })
}

</script>

<style lang="scss">
@import 'uview-plus/index.scss';
@import "@/static/iconfont/iconfont.scss";
// @import './static/styles/quill-editor.scss';
</style>
