<script>
import GDataTable from './GDataTable.vue'
/**
 * ## GDataTableEmployees
 * Employees用DataTableコンポーネント
 *
 * @author shisyamo4131
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
    sortBy: { type: [String, Array], default: 'code', required: false },
    sortDesc: { type: [Boolean, Array], default: true, required: false },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      if (this.$vuetify.breakpoint.xs) {
        return [{ text: '氏名', value: 'fullName' }]
      }
      return [
        { text: 'CODE', value: 'code' },
        { text: '氏名', value: 'fullName' },
        { text: '状態', value: 'status', sortable: false },
      ]
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="{ ...$props, ...$attrs }"
    :headers="headers"
    :mobile-breakpoint="0"
    v-on="$listeners"
  >
    <template #[`item.fullName`]="{ item }">
      <div class="text-caption grey--text text--darken-1">
        {{ `${item.lastNameKana} ${item.firstNameKana}` }}
      </div>
      <div>{{ `${item.lastName} ${item.firstName}` }}</div>
    </template>
    <template #[`item.status`]="{ item }">
      {{ $EMPLOYEE_STATUS[item.status] }}
    </template>
  </g-data-table>
</template>

<style></style>
