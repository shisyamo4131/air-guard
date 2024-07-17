<script>
/**
 * ### GDataTableWorkRegulations
 *
 * 就業規則のDataTableコンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-17 - 初版作成
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
    return {
      days: {
        mon: '月',
        tue: '火',
        wed: '水',
        thu: '木',
        fri: '金',
        sat: '土',
        sun: '日',
      },
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return [{ text: '就業規則名', value: 'name' }]
        case 'sm':
          return [
            { text: '就業規則名', value: 'name' },
            { text: '所定労働日', value: 'scheduledWorkDays' },
          ]
        default:
          return [
            { text: '就業規則名', value: 'name' },
            { text: '所定労働日', value: 'scheduledWorkDays' },
            { text: '法定休日', value: 'legalHoliday', align: 'center' },
            { text: '時間外', value: 'overtimePayRate', align: 'center' },
            { text: '休日', value: 'holidayPayRate', align: 'center' },
            { text: '賞与対象', value: 'bonusEligibility', align: 'center' },
          ]
      }
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="$attrs"
    disable-sort
    :headers="headers"
    :mobile-breakpoint="0"
    v-on="$listeners"
  >
    <template #[`item.scheduledWorkDays`]="{ item }">
      <div class="d-flex" style="gap: 4px">
        <v-chip
          v-for="day of Object.keys(days)"
          :key="day"
          :color="item.scheduledWorkDays.includes(day) ? 'primary' : undefined"
          label
          :ripple="false"
          small
        >
          {{ days[day] }}
        </v-chip>
      </div>
    </template>
    <template #[`item.bonusEligibility`]="{ item }">
      <v-icon v-if="item.bonusEligibility" color="primary">mdi-check</v-icon>
    </template>
    <template #[`item.overtimePayRate`]="{ item }">
      {{ `${item.overtimePayRate} %` }}
    </template>
    <template #[`item.holidayPayRate`]="{ item }">
      {{ `${item.holidayPayRate} %` }}
    </template>
    <template #[`item.legalHoliday`]="{ item }">
      <v-chip color="#E53935" dark label :ripple="false" small>
        {{ days[item.legalHoliday] }}
      </v-chip>
    </template>
  </g-data-table>
</template>

<style></style>
