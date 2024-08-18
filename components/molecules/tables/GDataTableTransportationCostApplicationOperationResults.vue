<script>
/**
 * ## GDataTableTransportationCostApplicationOperationResults
 *
 * 従業員単位で、交通費申請データの稼働実績明細を表示するためのDataTableコンポーネントです。
 *
 * ### 機能詳細
 * - `props.hideCost`を`true`にすると、交通費ボタンが非表示になります。
 * - 交通費ボタンをクリックすると`click:cost`イベントがemitされます。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-08-16 - 初版作成
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
    employeeId: { type: String, required: true },
    hideCost: { type: Boolean, default: false, required: false },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      const result = []
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          result.push(
            {
              text: '勤務',
              value: 'xsCol1',
              sortable: false,
              class: 'px-2',
              cellClass: 'px-2',
              width: this.hideCost ? '240' : '120',
            },
            {
              text: '休憩・残業',
              value: 'breakTimeOvertime',
              sortable: false,
              align: 'center',
              class: 'px-2',
              cellClass: 'px-2',
            }
          )
          break
        case 'sm':
          result.push(
            {
              text: '勤務',
              value: 'smCol1',
              sortable: false,
              class: 'px-2',
              cellClass: 'px-2',
            },
            {
              text: '開始・終了',
              value: 'startTimeEndTime',
              sortable: false,
              align: 'center',
              class: 'px-2',
              cellClass: 'px-2',
              width: '84',
            },
            {
              text: '休憩・残業',
              value: 'breakTimeOvertime',
              sortable: false,
              align: 'center',
              class: 'px-2',
              cellClass: 'px-2',
              width: '84',
            }
          )
          break
        case 'md':
          result.push(
            {
              text: '勤務日',
              value: 'date',
              sortable: false,
              class: 'px-2',
              cellClass: 'px-2',
              width: '120',
            },
            {
              text: '現場',
              value: 'siteAbbr',
              sortable: false,
              class: 'px-2',
              cellClass: 'px-2',
            },
            {
              text: '開始時刻',
              value: 'startTime',
              sortable: false,
              align: 'center',
              class: 'px-2',
              cellClass: 'px-2',
              width: '84',
            },
            {
              text: '終了時刻',
              value: 'endTime',
              sortable: false,
              align: 'center',
              class: 'px-2',
              cellClass: 'px-2',
              width: '84',
            },
            {
              text: '休憩時間',
              value: 'breakMinutes',
              sortable: false,
              align: 'center',
              class: 'px-2',
              cellClass: 'px-2',
              width: '84',
            },
            {
              text: '残業時間',
              value: 'overtimeMinutes',
              sortable: false,
              align: 'center',
              class: 'px-2',
              cellClass: 'px-2',
              width: '84',
            }
          )
          break
        default:
          result.push(
            {
              text: '勤務日',
              value: 'date',
              sortable: false,
              width: '120',
            },
            {
              text: '現場',
              value: 'siteAbbr',
              sortable: false,
            },
            {
              text: '開始時刻',
              value: 'startTime',
              sortable: false,
              align: 'center',
              width: '84',
            },
            {
              text: '終了時刻',
              value: 'endTime',
              sortable: false,
              align: 'center',
              width: '84',
            },
            {
              text: '休憩時間',
              value: 'breakMinutes',
              sortable: false,
              align: 'center',
              width: '84',
            },
            {
              text: '残業時間',
              value: 'overtimeMinutes',
              sortable: false,
              align: 'center',
              width: '84',
            }
          )
      }
      if (!this.hideCost) {
        result.push({
          text: '交通費',
          value: 'transportationCost',
          sortable: false,
          align: 'center',
          class: 'px-2',
          cellClass: 'px-2',
          width: '120',
        })
      }
      return result
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="$attrs"
    :headers="headers"
    :items-per-page="-1"
    :mobile-breakpoint="0"
    v-on="$listeners"
  >
    <template #[`item.xsCol1`]="{ header, item }">
      <div
        class="d-flex flex-column"
        :style="{ maxWidth: `${header.width}px` }"
      >
        <div>{{ item.date }}</div>
        <div class="text-truncate">{{ item.siteAbbr }}</div>
        <div>{{ `${item.startTime} ～ ${item.endTime}` }}</div>
      </div>
    </template>
    <template #[`item.smCol1`]="{ item }">
      <div class="d-flex flex-column" style="max-width: 228px">
        <div>{{ item.date }}</div>
        <div class="text-truncate">{{ item.siteAbbr }}</div>
      </div>
    </template>
    <template #[`item.startTimeEndTime`]="{ item }">
      <div>{{ item.startTime }}</div>
      <div>{{ item.endTime }}</div>
    </template>
    <template #[`item.breakTimeOvertime`]="{ item }">
      <div>{{ item.breakMinutes }}</div>
      <div>{{ item.overtimeMinutes }}</div>
    </template>
    <template #[`item.transportationCost`]="{ item }">
      <v-btn
        v-if="item.transportationCost.type === 'pass'"
        block
        depressed
        @click="$emit('click:cost', { docId: item.docId, employeeId })"
        >定期利用</v-btn
      >
      <v-btn
        v-else-if="item.transportationCost.type === 'non-subject'"
        block
        depressed
        @click="$emit('click:cost', { docId: item.docId, employeeId })"
        >対象外</v-btn
      >
      <v-btn
        v-else
        block
        depressed
        @click="$emit('click:cost', { docId: item.docId, employeeId })"
        >{{ item.transportationCost.amount.toLocaleString() }}</v-btn
      >
    </template>
  </g-data-table>
</template>

<style></style>
