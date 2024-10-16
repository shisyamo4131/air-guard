<script>
/**
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-10-16 - 初版作成
 */
import GDataTable from '~/components/atoms/tables/GDataTable.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTable },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * 稼働実績明細テーブルのカラム定義です。
     */
    headers() {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return [
            { text: '現場', value: 'siteId' },
            { text: '開始/終了', value: 'startEnd', align: 'center' },
          ]
        case 'sm':
          return [
            { text: '現場', value: 'siteId' },
            { text: '開始/終了', value: 'startEnd', align: 'center' },
            { text: '休憩時間', value: 'breakMinutes', align: 'right' },
            { text: '実働時間', value: 'workMinutes', align: 'right' },
            { text: '残業時間', value: 'overtimeMinutes', align: 'right' },
          ]
        case 'md':
          return [
            { text: '現場', value: 'siteId' },
            { text: '開始/終了', value: 'startEnd', align: 'center' },
            { text: '休憩時間', value: 'breakMinutes', align: 'right' },
            { text: '実働時間', value: 'workMinutes', align: 'right' },
            { text: '残業時間', value: 'overtimeMinutes', align: 'right' },
            { text: '深夜時間', value: 'nighttimeMinutes', align: 'right' },
          ]
        default:
          return [
            { text: '現場', value: 'siteId' },
            { text: '開始時刻', value: 'startTime', align: 'center' },
            { text: '終了時刻', value: 'endTime', align: 'center' },
            { text: '休憩時間', value: 'breakMinutes', align: 'right' },
            { text: '実働時間', value: 'workMinutes', align: 'right' },
            { text: '残業時間', value: 'overtimeMinutes', align: 'right' },
            { text: '深夜時間', value: 'nighttimeMinutes', align: 'right' },
          ]
      }
    },
    sortedItems() {
      return this.$attrs.items.slice().sort((a, b) => {
        if (a.startTime < b.startTime) return -1
        if (a.startTime > b.startTime) return 1
        return 0
      })
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="$attrs"
    :headers="headers"
    :items="sortedItems"
    item-key="docId"
    mobile-breakpoint="0"
    disable-sort
    v-on="$listeners"
  >
    <template #[`item.siteId`]="{ item }">
      {{ $store.getters[`sites/get`](item.siteId)?.abbr || 'undefined' }}
    </template>
    <template #[`item.date`]="{ item }">
      {{ item.date.slice(5) }}
    </template>
    <template #[`item.startEnd`]="{ item }">
      <div>{{ item.startTime }}</div>
      <div>{{ item.endTime }}</div>
    </template>
    <template #[`item.breakMinutes`]="{ item }">
      {{ `${item.breakHours.toFixed(2)} H` }}
    </template>
    <template #[`item.workMinutes`]="{ item }">
      {{ `${item.workHours.toFixed(2)} H` }}
    </template>
    <template #[`item.overtimeMinutes`]="{ item }">
      {{ `${item.overtimeHours.toFixed(2)} H` }}
    </template>
    <template #[`item.nighttimeMinutes`]="{ item }">
      {{ `${item.nighttimeHours.toFixed(2)} H` }}
    </template>
  </g-data-table>
</template>

<style></style>
