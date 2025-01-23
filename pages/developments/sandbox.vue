<template>
  <div>sandbox</div>
</template>

<script>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(tz)
export default {
  data() {
    return {
      startJST: dayjs.tz('2025-01-15 22:00', 'YYYY-MM-DD HH:mm', 'Asia/Tokyo'),
      endJST: dayjs.tz('2025-01-16 06:30', 'YYYY-MM-DD HH:mm', 'Asia/Tokyo'),
    }
  },
  computed: {
    beforeNightStart() {
      return this.startJST
        .clone()
        .subtract(1, 'day')
        .set('hour', 22)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0)
    },
    beforeNightEnd() {
      return this.startJST
        .clone()
        .set('hour', 5)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0)
    },
    currentNightStart() {
      return this.startJST
        .clone()
        .set('hour', 22)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0)
    },
    currentNightEnd() {
      return this.startJST
        .clone()
        .add(1, 'day')
        .set('hour', 5)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0)
    },
    times() {
      return [
        this.startJST,
        this.endJST,
        this.beforeNightStart,
        this.beforeNightEnd,
        this.currentNightStart,
        this.currentNightEnd,
      ].sort((a, b) => a.valueOf() - b.valueOf())
    },

    overlap() {
      // タイムスタンプを UTC に変換
      const start1 = dayjs.tz(this.startJST).utc().valueOf()
      const end1 = dayjs.tz(this.endJST).utc().valueOf()
      const start2 = dayjs.tz(this.currentNightStart).utc().valueOf()
      const end2 = dayjs.tz(this.currentNightEnd).utc().valueOf()

      // オーバーラップの開始と終了を計算
      const overlapStart = Math.max(start1, start2)
      const overlapEnd = Math.min(end1, end2)

      // オーバーラップ時間を計算（ミリ秒）
      const overlapMillis = Math.max(0, overlapEnd - overlapStart)

      // 分に変換して返す
      return Math.floor(overlapMillis / (1000 * 60))
    },
  },
}
</script>

<style></style>
