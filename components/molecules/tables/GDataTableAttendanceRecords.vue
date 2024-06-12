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
   * PROPS
   ***************************************************************************/
  props: {
    sortBy: {
      type: [String, Array],
      default: 'employee.code',
      required: false,
    },
  },
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
            sortable: false,
            align: 'right',
            width: 84,
          },
          {
            text: '残業',
            value: 'nonStatutoryOverTime',
            sortable: false,
            align: 'right',
            width: 84,
          },
          {
            text: '休日',
            value: 'holidayWorkingTime',
            sortable: false,
            align: 'right',
            width: 84,
          },
          {
            text: '時間外',
            value: 'overTimeTotal',
            sortable: false,
            align: 'right',
            width: 84,
          },
        ]
      } else {
        return [
          { text: '従業員', value: 'employee.code', width: 84 },
          {
            text: '所定',
            value: 'scheduledWorkingDays',
            sortable: false,
            align: 'right',
            width: 72,
          },
          {
            text: '時間外',
            value: 'overTimeTotal',
            sortable: false,
            align: 'right',
            width: 72,
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
    :sort-by="sortBy"
    v-on="$listeners"
  >
    <template #[`item.employee.code`]="{ item }">
      <div v-if="!$vuetify.breakpoint.mobile">{{ item.employee.code }}</div>
      <div v-else>
        <div>{{ item.employee.code }}</div>
        <div>{{ item.employee.fullName }}</div>
      </div>
    </template>
    <template #[`item.scheduledWorkingDays`]="{ item }">
      {{ `${item.scheduledWorkingDays} 日` }}
    </template>
    <template #[`item.nonStatutoryOverTime`]="{ item }">
      {{ `${item.nonStatutoryOverTime.toFixed(1)} H` }}
    </template>
    <template #[`item.holidayWorkingTime`]="{ item }">
      {{ `${item.holidayWorkingTime.toFixed(1)} H` }}
    </template>
    <template #[`item.overTimeTotal`]="{ item }">
      {{
        `${(item.nonStatutoryOverTime + item.holidayWorkingTime).toFixed(1)} H`
      }}
    </template>
  </g-data-table>
</template>

<style></style>
