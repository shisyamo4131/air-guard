<script>
/**
 * 取引先のDataTableコンポーネントです。
 * @author shisyamo4131
 *
 * @refact 2025-01-09
 */
import GChipSyncStatus from '~/components/atoms/chips/GChipSyncStatus.vue'
import GIconFax from '~/components/atoms/icons/GIconFax.vue'
import GIconPhone from '~/components/atoms/icons/GIconPhone.vue'
import GIconPlay from '~/components/atoms/icons/GIconPlay.vue'
import GIconStop from '~/components/atoms/icons/GIconStop.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTable,
    GChipSyncStatus,
    GIconPlay,
    GIconStop,
    GIconPhone,
    GIconFax,
  },

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
      const result = [
        { text: 'CODE', value: 'code', width: 84 },
        { text: '取引先名', value: 'abbr' },
      ]
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          break
        case 'sm':
          break
        case 'md':
          result.push({ text: '住所', value: 'address1', sortable: false })
          break
        default:
          result.push(
            { text: '住所', value: 'address1', sortable: false },
            { text: 'TEL/FAX', value: 'tel', sortable: false }
          )
      }
      result.push({
        text: '同期状態',
        value: 'sync',
        sortable: false,
        align: 'center',
      })
      return result
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="{ ...$props, ...$attrs }"
    :headers="headers"
    v-on="$listeners"
  >
    <template #[`item.abbr`]="{ item }">
      <div class="d-flex">
        <g-icon-play v-if="item.status === 'active'" color="green" left small />
        <g-icon-stop v-else color="red" left small />
        <div>
          <div>{{ item.name1 }}</div>
          <div v-if="item.name2" class="text-caption grey--text text--darken-1">
            {{ item.name2 }}
          </div>
        </div>
      </div>
    </template>
    <template #[`item.tel`]="{ item }">
      <div><g-icon-phone left x-small />{{ item.tel }}</div>
      <div><g-icon-fax left x-small />{{ item.fax }}</div>
    </template>
    <template #[`item.sync`]="{ item }">
      <g-chip-sync-status :value="item.sync" x-small />
    </template>
  </g-data-table>
</template>

<style></style>
