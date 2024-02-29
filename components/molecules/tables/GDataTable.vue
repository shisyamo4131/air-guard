<script>
/**
 * ## GDataTable
 *
 * @author shisyamo4131
 */
import ADataTable from '~/components/atoms/tables/ADataTable.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { ADataTable },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    actionType: {
      type: String,
      default: 'show-detail',
      validator: (v) => ['edit-delete', 'show-detail'].includes(v),
      required: false,
    },
    headers: { type: Array, default: () => [], required: false },
    height: { type: [Number, String], default: undefined, required: false },
    hidePagination: { type: Boolean, default: false, required: false },
    showActions: { type: Boolean, default: false, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      page: 1,
      pageCount: 0,
    }
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
      if (this.showActions) result.push(actionColumn)
      return result
    },
    internalHeight() {
      if (!this.height) return undefined
      if (parseInt(this.height) < this.paginationHeight) return undefined
      return parseInt(this.height) - this.paginationHeight
    },
    paginationHeight() {
      if (this.hidePagination) return 0
      return 76
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    page() {
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
  <a-data-table
    v-bind="$attrs"
    fixed-header
    :headers="internalHeaders"
    :height="internalHeight"
    hide-default-footer
    :page.sync="page"
    @page-count="pageCount = $event"
    v-on="$listeners"
  >
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
    <template #[`item.actions`]="props">
      <slot name="item.actions" v-bind="props">
        <div v-if="actionType === 'edit-delete'">
          <v-icon color="green" @click="$emit('click:edit', props.item)"
            >mdi-pencil</v-icon
          >
          <v-icon
            class="ml-2"
            color="red"
            @click="$emit('click:delete', props.item)"
            >mdi-delete</v-icon
          >
        </div>
        <div v-if="actionType === 'show-detail'">
          <v-icon @click="$emit('click:detail', props.item)"
            >mdi-chevron-right</v-icon
          >
        </div>
      </slot>
    </template>
    <template #footer="props">
      <slot name="footer" v-bind="props">
        <v-container v-if="!hidePagination" fluid style="height: 76px">
          <v-row justify="center" dense>
            <v-col cols="11">
              <v-pagination v-model="page" :length="pageCount" />
            </v-col>
          </v-row>
        </v-container>
      </slot>
    </template>
  </a-data-table>
</template>

<style></style>
