import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  actions: {
    increment() {
      this.count++
    }
  }
})

/*
import { useCounterStore } from '@/store/counter'
const counter = useCounterStore()
counter.count++
// 或使用 action 代替
counter.increment()
*/
