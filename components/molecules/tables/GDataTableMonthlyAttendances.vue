<script>
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import Employee from '~/models/Employee'
/**
 * ## GDataTableMonthlyAttendances
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-10-11 - 初版作成
 */
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
      if (this.$vuetify.breakpoint.lgAndUp) {
        return [
          { text: 'CODE', value: 'employee.code', width: 84 },
          {
            text: '従業員',
            value: 'employee.abbr',
            sortable: false,
            cellClass: 'truncate-cell',
          },
          {
            text: '所定内労働日数',
            value: 'totalScheduledWorkingDays',
            align: 'right',
          },
          {
            text: '法定内残業時間',
            value: 'statutoryOvertimeMinutes',
            align: 'right',
          },
          {
            text: '法定外残業時間',
            value: 'nonStatutoryOvertimeMinutes',
            align: 'right',
          },
          {
            text: '休日労働時間',
            value: 'holidayWorkingMinutes',
            align: 'right',
          },
          {
            text: '時間外合計',
            value: 'overtimeTotal',
            align: 'right',
          },
        ]
      } else if (this.$vuetify.breakpoint.md) {
        return [
          { text: '従業員', value: 'employee.code', width: 84 },
          {
            text: '所定内日数',
            value: 'totalScheduledWorkingDays',
            align: 'right',
          },
          {
            text: '法定内残業',
            value: 'statutoryOvertimeMinutes',
            align: 'right',
          },
          {
            text: '法定外残業',
            value: 'nonStatutoryOvertimeMinutes',
            align: 'right',
          },
          {
            text: '休日労働',
            value: 'holidayWorkingMinutes',
            align: 'right',
          },
          {
            text: '時間外合計',
            value: 'overtimeTotal',
            align: 'right',
          },
        ]
      } else if (this.$vuetify.breakpoint.sm) {
        return [
          { text: '従業員', value: 'employee.code', width: 84 },
          {
            text: '所定内',
            value: 'totalScheduledWorkingDays',
            align: 'right',
          },
          {
            text: '法定内',
            value: 'statutoryOvertimeMinutes',
            align: 'right',
          },
          {
            text: '時間外計',
            value: 'overtimeTotal',
            align: 'right',
          },
        ]
      } else {
        return [
          { text: '従業員', value: 'employee.code', width: 84 },
          {
            text: '時間外計',
            value: 'overtimeTotal',
            align: 'right',
          },
        ]
      }
    },
    arrangedItems() {
      return this.$attrs.items.map((item) => {
        const employee = new Employee(
          this.$store.getters['employees/get'](item.employeeId)
        )
        const overtimeTotal =
          item.nonStatutoryOvertimeMinutes + item.holidayWorkingMinutes
        return { ...item, employee, overtimeTotal }
      })
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="$attrs"
    :headers="headers"
    :items="arrangedItems"
    :mobile-breakpoint="0"
    sort-by="overTimeTotal"
    sort-desc
    v-on="$listeners"
  >
    <template #[`item.employee.code`]="{ item }">
      <div v-if="$vuetify.breakpoint.lgAndUp">
        {{ item.employee.code }}
      </div>
      <div v-else>
        <div>{{ item.employee.code }}</div>
        <div class="text-truncate" style="max-width: 84px">
          {{ item.employee.abbr }}
        </div>
      </div>
    </template>
    <template #[`item.totalScheduledWorkingDays`]="{ item }">
      {{ `${item.totalScheduledWorkingDays} 日` }}
    </template>
    <template #[`item.statutoryOvertimeMinutes`]="{ item }">
      {{ `${(item.statutoryOvertimeMinutes / 60).toFixed(1)} H` }}
    </template>
    <template #[`item.nonStatutoryOvertimeMinutes`]="{ item }">
      {{ `${(item.nonStatutoryOvertimeMinutes / 60).toFixed(1)} H` }}
    </template>
    <template #[`item.holidayWorkingMinutes`]="{ item }">
      {{ `${(item.holidayWorkingMinutes / 60).toFixed(1)} H` }}
    </template>
    <template #[`item.overtimeTotal`]="{ item }">
      {{ `${(item.overtimeTotal / 60).toFixed(1)} H` }}
    </template>
  </g-data-table>
</template>

<style></style>
