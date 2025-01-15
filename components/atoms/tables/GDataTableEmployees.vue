<script>
import GDataTable from './GDataTable.vue'
import GChipSyncStatus from '~/components/atoms/chips/GChipSyncStatus.vue'
/**
 * Employees用DataTableコンポーネント
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTable, GChipSyncStatus },
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
        const props = ['fullName', 'fullNameKana', 'abbrKana'].map((key) =>
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
      const result = []
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          result.push(
            { text: 'CODE', value: 'code', width: 84 },
            { text: '氏名', value: 'fullName' },
            {
              text: '同期状態',
              value: 'sync',
              sortable: false,
              align: 'center',
            }
          )
          break
        case 'sm':
          result.push(
            { text: 'CODE', value: 'code', width: 84 },
            { text: '氏名', value: 'fullName' },
            { text: '連絡先', value: 'mobile', sortable: false, width: 156 },
            {
              text: '同期状態',
              value: 'sync',
              sortable: false,
              align: 'center',
            }
          )
          break
        case 'md':
          result.push(
            { text: 'CODE', value: 'code', width: 84 },
            { text: '氏名', value: 'fullName' },
            { text: '住所', value: 'address1', sortable: false },
            {
              text: '同期状態',
              value: 'sync',
              sortable: false,
              align: 'center',
            }
          )
          break
        default:
          result.push(
            { text: 'CODE', value: 'code', width: 84 },
            { text: '氏名', value: 'fullName' },
            { text: '住所', value: 'address', sortable: false },
            { text: '連絡先', value: 'mobile', sortable: false, width: 156 },
            {
              text: '同期状態',
              value: 'sync',
              sortable: false,
              align: 'center',
            }
          )
      }
      return result
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="{ ...$props, ...$attrs }"
    :headers="headers"
    :mobile-breakpoint="600"
    :filter-props="['fullName', 'fullNameKana', 'abbrKana']"
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
            {{ `${item.fullNameKana}` }}
          </div>
          <div>{{ `${item.fullName}` }}</div>
        </div>
      </div>
    </template>
    <template #[`item.address`]="{ item }">
      <div class="d-flex">
        <div class="align-self-center">
          <v-icon x-small color="red" left>mdi-map-marker</v-icon>
        </div>
        <div>
          <div>{{ item.address1 }}</div>
          <div class="text-caption grey--text text--darken-1">
            {{ item.address2 }}
          </div>
        </div>
      </div>
    </template>
    <template #[`item.mobile`]="{ item }">
      <v-icon x-small left>mdi-cellphone</v-icon>{{ item.mobile }}
    </template>
    <template #[`item.sync`]="{ item }">
      <g-chip-sync-status :value="item.sync" x-small />
    </template>
  </g-data-table>
</template>

<style></style>
