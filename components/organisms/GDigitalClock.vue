<template>
  <v-card v-bind="$attrs" class="pa-4 mx-auto" v-on="$listeners">
    <div class="d-flex flex-column align-center">
      <h2 class="roboto text-left text-h6 mb-2">{{ date }}</h2>
      <h1 class="roboto text-center text-h4">{{ time }}</h1>
    </div>
  </v-card>
</template>

<script>
import ja from 'dayjs/locale/ja'
export default {
  data() {
    return {
      date: '',
      time: '',
    }
  },
  created() {
    this.updateDateTime()
    // 1秒ごとに日付と時刻を更新
    this.timer = setInterval(this.updateDateTime, 1000)
  },
  beforeDestroy() {
    // コンポーネントが破棄される際にタイマーをクリア
    clearInterval(this.timer)
  },
  methods: {
    updateDateTime() {
      const now = this.$dayjs()
      // 日付と時刻を日本語フォーマットで一時的に更新
      this.date = now.locale(ja).format('YYYY年MM月DD日 (ddd)') // 例: 2024年11月23日 (土)
      this.time = now.format('HH:mm:ss') // 例: 14:25:36
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400&display=swap');

.roboto {
  font-family: 'Roboto Mono', monospace;
}
</style>
