<script>
/**
 * ### GDataTableLeaveApplications
 * @author shisyamo4131
 *
 * 1. 申請フローが必要になったタイミングで改修が必要。
 */
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTable },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {}
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      if (!this.$vuetify.breakpoint.mobile) {
        return [
          { text: '申請日', value: 'requestDate', width: 120 },
          { text: '申請者', value: 'employee.abbr' },
          {
            text: '対象日',
            value: 'dates',
            align: 'center',
            sortable: false,
          },
          {
            text: '状態',
            value: 'status',
            sortable: false,
            align: 'center',
          },
          {
            text: '決済日',
            value: 'settlementDate',
            align: 'center',
            sortable: false,
          },
          // 承認フロー実装時にコメントアウト解除
          // {
          //   text: '',
          //   value: 'settlementActions',
          //   align: 'right',
          //   sortable: false,
          // },
        ]
      } else {
        return [
          { text: '申請者', value: 'employee.abbr' },
          {
            text: '対象日',
            value: 'dates',
            align: 'center',
            sortable: false,
          },
        ]
      }
    },
  },
}
</script>

<template>
  <!-- 承認フロー実装時にactionsを削除 -->
  <g-data-table
    v-bind="$attrs"
    :actions="['edit', 'delete']"
    :headers="headers"
    :mobile-breakpoint="0"
    sort-by="requestDate"
    sort-desc
    v-on="$listeners"
  >
    <template #[`item.dates`]="{ item }">
      <div v-if="item.dates.length === 1">
        {{ item.dates[0] }}
      </div>
      <v-btn v-else depressed small @click="$emit('click:show-dates', item)">
        {{ `${item.dates.length}日間` }}
      </v-btn>
    </template>
    <template #[`item.status`]="{ item }">
      <v-chip small>{{ $LEAVE_APPLICATION_STATUS[item.status] }}</v-chip>
    </template>
    <!-- 承認フロー実装時にコメントアウトを解除 -->
    <!-- <template #[`item.settlementActions`]="{ item }">
      <v-btn
        :disabled="item.status !== 'unapproved'"
        depressed
        small
        @click="$emit('click:edit', item)"
        >変更</v-btn
      >
      <v-btn
        :disabled="item.status !== 'unapproved'"
        depressed
        small
        @click="$emit('click:delete', item)"
        >削除</v-btn
      >
      <v-btn
        :disabled="item.status !== 'unapproved'"
        depressed
        small
        @click="$emit('click:approve', item)"
        >承認</v-btn
      >
      <v-btn
        :disabled="item.status !== 'unapproved'"
        depressed
        small
        @click="$emit('click:reject', item)"
        >却下</v-btn
      >
      <v-btn
        :disabled="item.status !== 'approved'"
        depressed
        small
        @click="$emit('click:withdraw', item)"
        >取下</v-btn
      >
    </template> -->
  </g-data-table>
</template>

<style></style>
