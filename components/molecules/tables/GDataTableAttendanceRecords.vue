<script>
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
/**
 * ### GDataTableAttendanceRecords
 * @author shisyamo4131
 *
 * @create 2024-06-12
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
      if (this.$vuetify.breakpoint.mdAndUp) {
        return [
          { text: 'CODE', value: 'employee.code', width: 84 },
          {
            text: '従業員',
            value: 'employee.fullName',
            sortable: false,
            cellClass: 'truncate-cell',
          },
          {
            text: '所定',
            value: 'scheduledWorkingDays',
            align: 'right',
            width: 132,
          },
          {
            text: '残業',
            value: 'nonStatutoryOverTime',
            align: 'right',
            width: 132,
          },
          {
            text: '休日',
            value: 'holidayWorkingTime',
            align: 'right',
            width: 132,
          },
          {
            text: '時間外合計',
            value: 'overTimeTotal',
            align: 'right',
            width: 132,
          },
        ]
      } else if (this.$vuetify.breakpoint.sm) {
        return [
          { text: '従業員', value: 'employee.code' },
          {
            text: '所定',
            value: 'scheduledWorkingDays',
            align: 'right',
            width: 96,
          },
          {
            text: '残業',
            value: 'nonStatutoryOverTime',
            align: 'right',
            width: 96,
          },
          {
            text: '休日',
            value: 'holidayWorkingTime',
            align: 'right',
            width: 96,
          },
          {
            text: '時間外',
            value: 'overTimeTotal',
            align: 'right',
            width: 96,
          },
        ]
      } else {
        return [
          { text: '従業員', value: 'employee.code' },
          {
            text: '所定',
            value: 'scheduledWorkingDays',
            align: 'right',
            width: 96,
          },
          {
            text: '時間外',
            value: 'overTimeTotal',
            align: 'right',
            width: 96,
          },
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
    sort-by="overTimeTotal"
    sort-desc
    v-on="$listeners"
  >
    <template #[`item.employee.code`]="{ item }">
      <div v-if="$vuetify.breakpoint.mdAndUp">{{ item.employee.code }}</div>
      <div v-else>
        <div>{{ item.employee.code }}</div>
        <div class="text-truncate" style="max-width: 84px">
          {{ item.employee.fullName }}
        </div>
      </div>
    </template>
    <template #[`item.scheduledWorkingDays`]="{ item }">
      {{ `${item.scheduledWorkingDays} 日` }}
    </template>
    <template #[`item.nonStatutoryOverTime`]="{ item }">
      {{ `${(item.nonStatutoryOverTime / 60).toFixed(1)} H` }}
    </template>
    <template #[`item.holidayWorkingTime`]="{ item }">
      {{ `${(item.holidayWorkingTime / 60).toFixed(1)} H` }}
    </template>
    <template #[`item.overTimeTotal`]="{ item }">
      {{ `${(item.overTimeTotal / 60).toFixed(1)} H` }}
    </template>
  </g-data-table>
</template>

<style></style>
