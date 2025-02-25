/**
 * @Author: Mojie
 * @Date: 2023-07-23 16:40:59
 */

import { getSongUrl } from '@/api/home'
import { PlayMode } from '@/utils/constants'
import { getPlayMode, setPlayMode } from '@/utils/storage'
import { getRandomIndexes, sleep } from '@/utils/index'
import { getFileName } from '../utils'
let isInitPlay = false
let AudioNotification = null

export const usePlayer = defineStore('player', () => {
  const audio = uni.getBackgroundAudioManager?.() || uni.createInnerAudioContext()
  const playList = ref([]) // 当前播放列表
  const playing = ref(false) // 是否正在播放
  const currentIndex = ref(uni.getStorageSync('currentIndex') || 0) // 当前播放的索引
  const currentTime = ref(0) // 当前播放时间
  const progressDragging = ref(false) // 是否正在拖动播放的进度条
  const switching = ref(false) // 是否正在切歌
  const playMode = ref(getPlayMode() || PlayMode.Sequence) // 播放模式
  const randomPlayIndexes = ref([]) // 随机播放时，根据播放列表随机生成的索引列表
  const currUrl = ref('')

  /** 当前播放的歌曲 */
  const currentSong = computed(() => {
    uni.setStorageSync('currentIndex', currentIndex.value)
    return playList.value[currentIndex.value] ?? {}
  })
  /** 播放模式的icon */
  const modeIcon = computed(() => {
    const type = {
      [PlayMode.Sequence]: 'icon-sequence',
      [PlayMode.Loop]: 'icon-loop',
      [PlayMode.Random]: 'icon-random',
    }
    return type[playMode.value]
  })
  /** 播放模式的文字 */
  const modeText = computed(() => {
    const type = {
      [PlayMode.Sequence]: '顺序播放',
      [PlayMode.Loop]: '循环播放',
      [PlayMode.Random]: '随机播放',
    }
    return type[playMode.value]
  })

  /**
   * 获取歌曲播放地址
   * @param id 歌曲id
   * @param source 歌曲来源
   */
  async function fetchSongUrl(song = currentSong.value, source) {
    isInitPlay = true
    audio.stop()
    currentTime.value = 0

    try {
      const { data } = await getSongUrl(song, source)
      const url = data.raw_url
      currUrl.value = url
      setAudioInfo(url)
      setNotify(song)
      // playing.value = true 请求时间不同，导致唱针的动画不一致
    } catch ({ statusCode }) {
      if (statusCode === 404) {
        uni.showModal({
          title: '提示',
          content: `${source}源中没有该歌曲`,
          showCancel: false,
        })
        // 用于player页面
        return Promise.reject(new Error(`${source}源中没有该歌曲`))
      }

      uni.showModal({
        title: '提示',
        content: '获取播放地址失败',
        showCancel: false,
      })
    }
  }

  function setNotify(song) {
    // #ifdef APP-PLUS
    if (!AudioNotification) AudioNotification = uni.requireNativePlugin("Audio-Notification")
    AudioNotification.showView({ 
      title: getFileName(song.name) || '音乐播放', 
      singer: song.path || '暂无', 
      image: 'https://www.199311.xyz/dmusic.png', 
    }, handleNotification)
    // #endif
  }

  function handleNotification(e) {
    console.log('handleNotification', e.btn); 
    switch (e.btn) { 
      case 0: // 点击了上一曲 
        onPrev();
        break;
      case 1: // 点击了暂停按钮 
        togglePlay(true);
        break;
      case 2: // 点击了播放按钮 
        togglePlay(true);
        break; 
      case 3: // 点击了下一曲 
        onNext();
        break; 
      case 4: // 点击了关闭按钮 
        AudioNotification.hideView(); 
        break; 
    }
  }

  /**
   * 设置歌曲信息
   * @param url 歌曲地址
   */
  function setAudioInfo(url) {
    const audioVal = audio
    const currentSongVal = currentSong.value

    audioVal.title = currentSongVal.name
    audioVal.singer = currentSongVal.path
    // audioVal.epname = currentSongVal.album.name
    // audioVal.coverImgUrl = currentSongVal.album.picUrl
    audioVal.src = url
    audioVal.play()

    // #ifdef H5
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSongVal.name,
        artist: currentSongVal.path,
        // album: currentSongVal.album.name,
        // artwork: [
        //   {
        //     src: `${currentSongVal.album.picUrl}?param=512y512`,
        //     sizes: '512x512',
        //     type: 'image/png',
        //   },
        // ],
      })
    }
    // #endif
  }

  /**
   * 触发播放
   * @param songs 歌曲列表
   * @param index 索引
   */
  function onPlay(songs, index) {
    playList.value = songs
    currentIndex.value = index
    playing.value = true
    fetchSongUrl()
    savePlayList()
  }

  function addPlay(song, isPlay) {
    let ind = playList.value.findIndex((item) => `${item.path}${item.name}` === `${song.path}${song.name}`)
    if (ind === -1){
      playList.value.push({...song})
      ind = playList.value.length - 1
    }
    if (isPlay && (currentIndex.value != ind || !playing.value)) {
      currentIndex.value = ind
      playing.value = true
      fetchSongUrl()
    }
    savePlayList()
  }

  function delPlay(song) {
    let ind = playList.value.findIndex((item) => `${item.path}${item.name}` === `${song.path}${song.name}`)
    if (ind != -1) {
      playList.value.splice(ind, 1)
      if (currentIndex.value == ind) {
        onNext()
      } else if (currentIndex.value > ind) {
        currentIndex.value--
      }
      savePlayList()
    }
  }

  /**
   * 切换播放
   */
  function togglePlay(isByNotify) {
    if (!isInitPlay) {
      playing.value = true
      fetchSongUrl()
      return
    }
    playing.value ? audio.pause() : audio.play()
    if (isByNotify !== true && AudioNotification) {
      playing.value ? AudioNotification.pause() : AudioNotification.play()
    }
  }

  /**
   * 上一曲
   */
  async function onPrev() {
    const _currentIndex = currentIndex.value
    let index = _currentIndex - 1

    switching.value = true
    playing.value = false

    // 切换歌曲后有延迟，还在播放之前的歌曲，所以把时间归零并停止播放
    currentTime.value = 0
    audio.stop()

    // 判断是否为随机播放
    if (playMode.value === PlayMode.Random) {
      const _randomPlayIndexes = randomPlayIndexes.value
      const length = _randomPlayIndexes.length
      let randomIndex = (index + length) % length

      // 如果上一个索引与当前索引相同
      if (_randomPlayIndexes[randomIndex] === _currentIndex) {
        // 如果相同，将随机索引设置为当前索引，以避免重复播放相同的歌曲
        randomIndex = _currentIndex
      }

      const prevIndex = _randomPlayIndexes[randomIndex]
      index = prevIndex
    }

    // 如果是第一首歌就设置成最后一首歌
    const prevIndex = index < 0 ? playList.value.length - 1 : index
    currentIndex.value = prevIndex
    fetchSongUrl()
    await sleep(300) // 延迟300毫秒让唱针的动画统一
    playing.value = true
    switching.value = false
  }

  /**
   * 下一曲
   */
  async function onNext() {
    const _currentIndex = currentIndex.value
    let index = _currentIndex + 1

    switching.value = true
    playing.value = false

    // 切换歌曲后有延迟，还在播放之前的歌曲，所以把时间归零并停止播放
    currentTime.value = 0
    audio.stop()

    console.log('randomPlayIndexes.value', randomPlayIndexes.value);

    // 判断是否为随机播放
    if (playMode.value === PlayMode.Random) {
      const _randomPlayIndexes = randomPlayIndexes.value
      let randomIndex = index % _randomPlayIndexes.length

      // 如果下一个索引与当前索引相同
      if (_randomPlayIndexes[randomIndex] === _currentIndex) {
        // 如果相同，将随机索引设置为当前索引，以避免重复播放相同的歌曲
        randomIndex = _currentIndex
      }

      const nextIndex = _randomPlayIndexes[randomIndex]
      index = nextIndex
    }

    // 如果是最后一首歌就设置成第一首歌
    const nextIndex = index === playList.value.length ? index = 0 : index
    currentIndex.value = nextIndex
    fetchSongUrl()
    await sleep(300) // 延迟300毫秒让唱针的动画统一
    playing.value = true
    switching.value = false
  }

  /**
   * 循环播放
   */
  function onLoopPlay() {
    audio.seek(0)
    audio.play()

    // #ifdef MP-WEIXIN
    // 微信小程序中循环播放需要重新设置歌曲地址，目前未找到解决方案
    fetchSongUrl()
    // #endif
  }

  /**
   * 改变播放模式
   */
  function changePlayMode() {
    console.log('unref(playMode)', unref(playMode));
    const mode = Object.values(PlayMode)[(Object.values(PlayMode).indexOf(playMode.value) + 1) % 3]
    // 如果是随机播放则设置随机播放索引列表
    if (PlayMode.Random === mode) {
      randomPlayIndexes.value = getRandomIndexes(playList.value.length)
    }
    playMode.value = mode
    // 将播放模式存储到本地中
    setPlayMode(mode)
    uni.showToast({
      title: modeText.value,
      icon: 'none',
    })
  }

  /**
   * 清除播放列表
   */
  function clearSongList() {
    playList.value = []
    currentIndex.value = 0
    playing.value = false
    currentTime.value = 0
    audio.stop()
    savePlayList()
  }

  function savePlayList() {
    if (PlayMode.Random === playMode.value) {
      randomPlayIndexes.value = getRandomIndexes(playList.value.length)
    }
    uni.setStorageSync('playList', playList.value)
  }

  function backPlayList() {
    const temp = uni.getStorageSync('playList')
    if (temp && temp.length) {
      playList.value = temp
    }
    if (PlayMode.Random === playMode.value) {
      randomPlayIndexes.value = getRandomIndexes(playList.value.length)
    }
  }

  return {
    audio,
    playList,
    currentIndex,
    playing,
    currentSong,
    currentTime,
    progressDragging,
    switching,
    playMode,
    randomPlayIndexes,
    modeIcon,
    modeText,
    currUrl,
    fetchSongUrl,
    addPlay,
    delPlay,
    onPlay,
    togglePlay,
    onPrev,
    onNext,
    onLoopPlay,
    changePlayMode,
    clearSongList,
    backPlayList,
    savePlayList,
  }
})
