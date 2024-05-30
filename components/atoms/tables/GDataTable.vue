<script>
import GIconDelete from '~/components/atoms/icons/GIconDelete.vue'
import GIconEdit from '~/components/atoms/icons/GIconEdit.vue'
import GIconDetail from '~/components/atoms/icons/GIconDetail.vue'
/**
 * ## GDataTable
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GIconDelete,
    GIconEdit,
    GIconDetail,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    actions: { type: Array, default: () => [], required: false },
    disableEdit: { type: Boolean, default: false, required: false },
    disableDelete: { type: Boolean, default: false, required: false },
    disableDetail: { type: Boolean, default: false, required: false },
    headers: { type: Array, default: () => [], required: false },
    height: { type: [Number, String], default: undefined, required: false },
    itemKey: { type: String, default: 'docId', required: false },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    internalHeaders() {
      const actionColumn = {
        text: '',
        value: 'actions',
        sortable: false,
        align: 'right',
      }
      const result = this.headers.map((item) => item)
      if (this.actions.length) result.push(actionColumn)
      return result
    },
    internalHeight() {
      if (!this.height) return undefined
      const result = parseInt(this.height)
      return result <= 0 ? undefined : result
    },
  },
  /***************************************************************************
   * WATCh
   ***************************************************************************/
  watch: {
    '$attrs.page'(newVal, oldVal) {
      if (newVal === oldVal) return
      this.scrollToTop()
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    scrollToTop() {
      const wrapper = this.$el.querySelector('div.v-data-table__wrapper')
      this.$vuetify.goTo(this, { container: wrapper })
    },
  },
}
</script>

<template>
  <v-data-table
    v-bind="$attrs"
    fixed-header
    :headers="internalHeaders"
    :height="internalHeight"
    hide-default-footer
    :item-key="itemKey"
    v-on="$listeners"
  >
    <!-- ### SLOTS ### -->
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
    <!-- ### ACTIONS COLUMN ### -->
    <template #[`item.actions`]="props">
      <slot name="item.actions" v-bind="props">
        <v-btn
          v-if="actions.includes('edit')"
          icon
          :disabled="disableEdit"
          @click="$emit('click:edit', props.item)"
        >
          <g-icon-edit />
        </v-btn>
        <v-btn
          v-if="actions.includes('delete')"
          icon
          :disabled="disableDelete"
          @click="$emit('click:delete', props.item)"
        >
          <g-icon-delete />
        </v-btn>
        <v-btn
          v-if="actions.includes('detail')"
          icon
          :disabled="disableDetail"
          @click="$emit('click:detail', props.item)"
        >
          <g-icon-detail />
        </v-btn>
      </slot>
    </template>
  </v-data-table>
</template>

<style></style>
