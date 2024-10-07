<script>
/**
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-10-07 - 初版作成
 */
import GDataTable from '~/components/atoms/tables/GDataTable.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTable },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    disableEdit: { type: Boolean, default: false, required: false },
  },

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
          return [{ text: '氏名', value: 'employeeId' }]
        case 'sm':
          return [
            { text: '氏名', value: 'employeeId' },
            { text: '開始終了', value: 'startEnd', align: 'center' },
          ]
        case 'md':
          return [
            { text: '氏名', value: 'employeeId' },
            { text: '開始終了', value: 'startEnd', align: 'center' },
            { text: '休憩時間', value: 'breakMinutes', align: 'right' },
            { text: '実働時間', value: 'workMinutes', align: 'right' },
            { text: '残業時間', value: 'overtimeMinutes', align: 'right' },
          ]
        default:
          return [
            { text: '氏名', value: 'employeeId' },
            { text: '勤務日', value: 'date', align: 'center' },
            { text: '開始時刻', value: 'startTime', align: 'center' },
            { text: '終了時刻', value: 'endTime', align: 'center' },
            { text: '休憩時間', value: 'breakMinutes', align: 'right' },
            { text: '実働時間', value: 'workMinutes', align: 'right' },
            { text: '残業時間', value: 'overtimeMinutes', align: 'right' },
            { text: '深夜時間', value: 'nighttimeMinutes', align: 'right' },
          ]
      }
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="$attrs"
    :headers="headers"
    item-key="id"
    :actions="disableEdit ? [] : ['edit', 'delete']"
    disable-sort
    mobile-breakpoint="0"
    v-on="$listeners"
  >
    <template #[`item.employeeId`]="{ item }">
      <div v-if="item.employeeId">
        {{
          $store.getters[`employees/get`](item.employeeId)?.abbr || 'undefined'
        }}
      </div>
      <div v-else>
        {{
          $store.getters[`outsourcers/get`](item.outsourcerId)?.abbr ||
          'undefined'
        }}
      </div>
    </template>
    <template #[`item.date`]="{ item }">
      {{ item.date.slice(5) }}
    </template>
    <template #[`item.startEnd`]="{ item }">
      <div>{{ item.startTime }}</div>
      <div>{{ item.endTime }}</div>
    </template>
    <template #[`item.breakMinutes`]="{ item }">
      {{ `${item.breakHours.toFixed(2)} 時間` }}
    </template>
    <template #[`item.workMinutes`]="{ item }">
      {{ `${item.workHours.toFixed(2)} 時間` }}
    </template>
    <template #[`item.overtimeMinutes`]="{ item }">
      {{ `${item.overtimeHours.toFixed(2)} 時間` }}
    </template>
    <template #[`item.nighttimeMinutes`]="{ item }">
      {{ `${item.nighttimeHours.toFixed(2)} 時間` }}
    </template>
  </g-data-table>
</template>

<style></style>
