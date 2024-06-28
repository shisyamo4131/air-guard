<script>
/**
 * ## GDataTableEmployees
 *
 * Employees用DataTableコンポーネント
 *
 * 機能詳細:
 * - 氏名、氏名カナで検索がヒットするようにcustomFilterを使用しています。
 *
 * @author shisyamo4131
 * @create 2024-06-28
 * @version 1.0.0
 */
import GDataTable from '../../atoms/tables/GDataTable.vue'
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
   * DATA
   ***************************************************************************/
  data() {
    return {
      customFilter: (value, search, item) => {
        if (!search) return true
        const props = ['fullName', 'fullNameKana'].map((key) =>
          item[key].toLowerCase()
        )
        return props.some((prop) => prop.includes(search))
      },
    }
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
    :custom-filter="customFilter"
    v-on="$listeners"
  >
    <template #[`item.fullName`]="{ item }">
      <div class="d-flex">
        <div class="align-self-center">
          <v-icon v-if="item.status === 'active'" color="green" left x-small
            >mdi-play</v-icon
          ><v-icon v-else color="red" left x-small>mdi-stop</v-icon>
        </div>
        <div>
          <div class="text-caption grey--text text--darken-1">
            {{ `${item.lastNameKana} ${item.firstNameKana}` }}
          </div>
          <div>{{ `${item.lastName} ${item.firstName}` }}</div>
        </div>
      </div>
    </template>
  </g-data-table>
</template>

<style></style>
