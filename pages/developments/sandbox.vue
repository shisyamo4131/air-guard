<template>
  <v-card>
    <v-card-text>
      {{ workMinutes }}
    </v-card-text>
  </v-card>
</template>

<script>
import OperationResult from '~/models/OperationResult'
export default {
  data() {
    return {
      instance: new OperationResult(),
      date: '2025-01-23',
      startTime: '22:00',
      endTime: '06:00',
      breakMinutes: 60,
      endAtNextday: true,
      scheduledMinutes: 480,
    }
  },
  computed: {
    workMinutes() {
      // 勤務日、開始時刻、終了時刻が未入力であれば 0 を返す
      if (!this.date) return 0
      if (!this.startTime || !this.endTime) return 0

      // 休憩時間が数値でなければ 0 を返す
      if (typeof this.breakMinutes !== 'number') return 0

      // 所定時間が数値でなければ 0 を返す
      if (typeof this.scheduledMinutes !== 'number') return 0

      // 開始時刻、終了時刻から dayjs オブジェクトを生成
      const from = this.$dayjs(`${this.date} ${this.startTime}`)
      let to = this.$dayjs(`${this.date} ${this.endTime}`)
      if (this.endAtNextday) to = to.add(1, 'day') // 翌日終了フラグによる日の加算

      // 時間差（分）を算出し、休憩時間を差し引く
      const total = to.diff(from, 'minute') - this.breakMinutes

      // 所定時間と計算結果とを比較して小さい方を返す
      return Math.min(this.scheduledMinutes, total)
    },
  },

  mounted() {
    this.instance.fetch('7yEIUtRXd1OeERG25ILH')
  },
}
</script>

<style></style>
