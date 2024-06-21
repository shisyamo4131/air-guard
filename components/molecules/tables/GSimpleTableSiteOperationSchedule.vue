<script>
/**
 * ### GSimpleTableSiteOperationSchedule
 *
 * 現場の稼働予定情報を表示するためのSimpleTableコンポーネントです。
 * `props.event`にイベントオブジェクトを受け取り、適宜表示します。
 *
 * @component
 * @example
 * <GSimpleTableSiteOperationSchedule
 *   :event="event"
 * />
 *
 * @props {Object} event - 現場の稼働予定イベントオブジェクト
 *
 * @author shisyamo4131
 * @create 2024-06-18
 */
import dayjs from 'dayjs'
import ja from 'dayjs/locale/ja'
import GChipWorkShift from '../../atoms/chips/GChipWorkShift.vue'
export default {
  components: { GChipWorkShift },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    event: { type: Object, required: true },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    address() {
      return this.event?.site?.address || 'error'
    },
    date() {
      const date = this.event?.schedule?.date || undefined
      if (!date) return 'error'
      return dayjs(date).format('YYYY年MM月DD日（ddd）')
      // return this.event?.schedule?.date || 'error'
    },
    end() {
      return this.event?.schedule?.end || 'error'
    },
    name() {
      return this.event?.site?.name || 'error'
    },
    qualification() {
      return this.event?.schedule?.qualification
    },
    remarks() {
      return this.event?.schedule?.remarks || ''
    },
    requiredWorkers() {
      return this.event?.schedule?.requiredWorkers || 'error'
    },
    start() {
      return this.event?.schedule?.start || 'error'
    },
    workShift() {
      return this.event?.schedule?.workShift || 'error'
    },
  },
  created() {
    dayjs.locale(ja)
  },
}
</script>

<template>
  <v-simple-table>
    <tbody>
      <tr>
        <td style="width: 132px; max-width: 132px">
          <v-icon left small>mdi-map-marker</v-icon>住所
        </td>
        <td>
          {{ address }}
        </td>
      </tr>
      <tr>
        <td><v-icon left small>mdi-calendar</v-icon>稼働予定日</td>
        <td>
          <slot name="date" v-bind="event">
            {{ date }}
          </slot>
        </td>
      </tr>
      <tr>
        <td><v-icon left small>mdi-account-clock</v-icon>勤務区分</td>
        <td>
          <g-chip-work-shift :work-shift="workShift" small />
        </td>
      </tr>
      <tr>
        <td><v-icon left small>mdi-clock-time-eight</v-icon>時間</td>
        <td>
          {{ `${start} - ${end}` }}
        </td>
      </tr>
      <tr>
        <td><v-icon left small>mdi-account-group</v-icon>人数</td>
        <td>
          {{ `${requiredWorkers} 名`
          }}<span v-if="qualification" class="red--text">（要資格）</span>
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <v-card-text style="white-space: pre-wrap">{{ remarks }}</v-card-text>
        </td>
      </tr>
    </tbody>
  </v-simple-table>
</template>

<style></style>
