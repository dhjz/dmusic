/**
 * @Author: Mojie
 * @Date: 2023-08-25 17:44:02
 */

 import { getSongUrl, getRawFile } from '@/api/home'
 import { usePlayer } from '@/store/player'
 import { getFileName, throttle } from '@/utils/index';
 import request from '@/utils/request'

 let timer = null;

 export function useLyric() {
   const isLyric = ref(uni.getStorageSync('isLyric') || false) // 是否显示歌词
   const lyricList = ref([]) // 歌词列表
   const lyricText = ref('')
   const remoteLyrics = ref([])
   const currentLyricIndex = ref(0) // 当前播放歌词的索引
   const scrollTop = ref(0) // 滚动条位置
   const lyricSize = ref(14) // 是否显示歌词
 
   const { currentSong, currentTime } = storeToRefs(usePlayer())
 
   watch(currentSong, () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    timer = setTimeout(() => fetchLyric(), 200)
   }, { immediate: true })
   watch(currentTime, () => scrollLyric())

   watch(isLyric, () => uni.setStorageSync('isLyric', isLyric.value))
 
   async function fetchLyric() {
     console.log(333);
     if (!currentSong.value.name) return
     lyricList.value = []
     remoteLyrics.value = []

     let songs = uni.getStorageSync('SONGS')
     if (!songs || !songs.length) return 
     const songName = getFileName(currentSong.value.name)
     let song = songs.find(item => `${songName}.lrc`.toLowerCase() === item.name.toLowerCase())
     let lyric = ''
     if (!song) { // 尝试在线请求
      let lyricRes = await request({ url: `https://api.lrc.cx/jsonapi?title=${songName}&album=&artist=`, noToken: true })
      console.log('lyricRes', lyricRes);
      if (lyricRes && lyricRes.length && songName === getFileName(currentSong.value.name)) {
        lyricRes = lyricRes.filter(x => x.lyrics && x.lyrics.trim())
        lyric = (lyricRes[0].lyrics || '')
        let lyricTemp = uni.getStorageSync('lyricTemp') || {}
        if (lyricTemp[songName]) {
          const one = lyricRes.find(x => x.id === lyricTemp[songName])
          if (one) lyric = one.lyrics
        }
        remoteLyrics.value = lyricRes
      }
     } else {
       const { data } = await getSongUrl(song)
       if (!data.raw_url) return
       const lyricRes = await getRawFile(`${song.path}/${song.name}`, { sign: data.sign, alist_ts: Date.now()  })
       lyric = (lyricRes || '')
     }
     if (songName === getFileName(currentSong.value.name)) {
       setLyricList(lyric)
     }
   }

   function setLyricList(lyricStr) {
    lyricText.value = lyricStr
    let lyric = lyricStr.split(/\r?\n|\r/)
    if (!lyric.length) return
 
    const timeReg = /^\[(\d{2}:\d{2}\.\d{1,})\]\s*(.*)$/
    lyric.forEach((item) => {
      const match = timeReg.exec(item)
      if (match) {
        const content = match[2]
        // 过滤空内容。如：'[00:00.123] '
        if (!content) return
        lyricList.value.push({
          time: match[1],
          content,
        })
      }
    })
    // console.log(currentSong.value.name, lyricList.value);
   }

   function setLyricTemp(name, id) {
    let lyricTemp = uni.getStorageSync('lyricTemp') || {}
    lyricTemp[name] = id
    uni.setStorageSync('lyricTemp', lyricTemp)
   }
 
   function scrollLyric() {
     // 如果当前播放时间为0则重置
     if (currentTime.value === 0) {
       scrollTop.value = 0
       currentLyricIndex.value = 0
     }
     // 获取每行歌词的高度
     const lineHeight = 16 + lyricSize.value * 1.1
     // 获取当前歌词行的索引
     const lyricIndex = currentLyricIndex.value = getCurrentLyricIndex()
     // 计算歌词滚动的距离
     const scrollDistance = lyricIndex * lineHeight + 30
 
     // 当歌词索引大于6行才开始设置滚动条位置
     if (lyricIndex > 6) {
       scrollTop.value = scrollDistance - (6 * lineHeight)
     }
   }
 
   function getCurrentLyricIndex() {
     let _currentLyricIndex = 0
 
     // 遍历歌词数组，找到当前播放时间对应的歌词行索引
     lyricList.value.forEach((item, index) => {
       const lineTime = lyricList.value && lyricList.value[index].time
 
       // 将毫秒转换为分钟秒
       const lineTimeMinutes = Number(lineTime.split(':')[0])
       const lineTimeSeconds = Number(lineTime.split(':')[1])
       const lineTimeMilliseconds = Number(lineTime.split('.')[1])
       // 计算当前播放时间的分钟秒数
       const lineTimeSum = lineTimeMinutes * 60 + lineTimeSeconds + (lineTimeMilliseconds / 1000)
       // 如果当前播放时间大于等于歌词行的时间，则将当前行索引赋值给_currentLyricIndex
       if (currentTime.value >= lineTimeSum) {
         _currentLyricIndex = index
       }
     })
 
     return _currentLyricIndex
   }

   function setSize(size) {
     lyricSize.value = size
   }
 
   return {
     isLyric,
     lyricList,
     currentLyricIndex,
     scrollTop,
     remoteLyrics,
     lyricText,
     setSize,
     setLyricList,
     setLyricTemp,
     fetchLyric,
   }
 }
 