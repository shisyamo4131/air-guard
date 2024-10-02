<script>
/**
 * ## GDataTableTransportationCostApplications
 *
 * 交通費申請データ管理用のDataTableです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-08-15 - 初版作成
 */
import GDataTableTransportationCostApplicationOperationResults from './GDataTableTransportationCostApplicationOperationResults.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTable,
    GDataTableTransportationCostApplicationOperationResults,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    items: { type: Array, default: () => [], required: false },
    itemsPerPage: { type: Number, default: -1, required: false },
    status: {
      type: String,
      default: '0:creating',
      validator: (v) =>
        [
          '0:creating',
          '1:draft',
          '2:pending',
          '3:approved',
          '4:settled',
          '8:rejected',
          '9:expired',
        ].includes(v),
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
      return [
        { text: '従業員', value: 'employeeId' },
        { text: '', value: 'data-table-expand' },
      ]
    },
    /**
     * DataTableが参照する配列です。
     * - `props.items`の各要素に`employee`と`group`を追加します。
     * - `group`は、DataTableの`groupBy`に使用する値です。
     */
    computedItems() {
      return this.items.reduce((sum, item) => {
        const exist = sum.find(
          ({ employeeId }) => employeeId === item.employeeId
        )
        if (exist) {
          exist.operationResults.push(...item.operationResults)
        } else {
          const employee =
            this.$store.getters['employees/get'](item.employeeId) ||
            this.$Employee()
          sum.push({
            employeeId: item.employeeId,
            employee,
            operationResults: [...item.operationResults],
          })
        }
        return sum
      }, [])
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.$store.dispatch('employees/clearTemporary')
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {},
}
</script>

<template>
  <g-data-table
    v-bind="{ ...$props, ...$attrs }"
    :headers="headers"
    :items="computedItems"
    item-key="employeeId"
    :mobile-breakpoint="0"
    sort-by="employee.code"
    show-expand
    single-expand
    v-on="$listeners"
  >
    <template #expanded-item="{ headers: hdrs, item }">
      <td :colspan="hdrs.length" style="padding: 8px">
        <g-data-table-transportation-cost-application-operation-results
          :employee-id="item.employeeId"
          :items="item.operationResults"
          hide-cost
        />
      </td>
    </template>
    <template #[`item.employeeId`]="{ item }">
      {{ `[${item.employee.code}] ${item.employee.fullName}` }}
    </template>
  </g-data-table>
</template>

<style></style>
