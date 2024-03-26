<script>
import GTextFieldSearch from '../inputs/GTextFieldSearch.vue'
import AIconDelete from '~/components/atoms/icons/AIconDelete.vue'
import AIconEdit from '~/components/atoms/icons/AIconEdit.vue'
import AIconNext from '~/components/atoms/icons/AIconNext.vue'
import ADataTable from '~/components/atoms/tables/ADataTable.vue'
/**
 * ## GDataTable
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    ADataTable,
    AIconNext,
    AIconDelete,
    AIconEdit,
    GTextFieldSearch,
  },
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
    hideSearch: { type: Boolean, default: false, required: false },
    lazySearch: { type: undefined, default: undefined, required: false },
    loading: { type: Boolean, default: false, required: false },
    search: { type: undefined, default: undefined, required: false },
    showActions: { type: Boolean, default: false, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      internalLazySearch: null,
      internalSearch: null,
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
      const result =
        parseInt(this.height) - this.searchBarHeight - this.paginationHeight
      return result <= 0 ? undefined : result
    },
    paginationHeight() {
      if (this.hidePagination) return 0
      return 76
    },
    searchBarHeight() {
      if (this.hideSearch) return 0
      if (this.$vuetify.breakpoint.smAndDown) return 56
      return 64
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    internalLazySearch(newVal, oldVal) {
      if (newVal === oldVal) return
      this.$emit('update:lazySearch', newVal)
    },
    internalSearch(newVal, oldVal) {
      if (newVal === oldVal) return
      this.$emit('update:search', newVal)
    },
    page() {
      this.scrollToTop()
    },
    search: {
      handler(v) {
        this.internalSearch = v
      },
      immediate: true,
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
    <!-- ### SLOTS ### -->
    <!-- Provides all slots of ADataTable. -->
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
    <!-- ### SEARCH BAR ### -->
    <!-- Search bar is shown at top position if 'hideSearch' prop is false. -->
    <template v-if="!hideSearch" #top>
      <v-toolbar flat>
        <g-text-field-search
          v-model="internalSearch"
          :lazy-value.sync="internalLazySearch"
          :loading="loading"
        />
      </v-toolbar>
    </template>
    <!-- ### ACTIONS COLUMN ### -->
    <!-- Show 'edit' and 'delete' buttons if 'actionType' prop is 'edit-delete'. -->
    <!-- Show 'next' button if 'actionType' prop is 'show-detail'. -->
    <!-- Actions column setting is included by computed. -->
    <template #[`item.actions`]="props">
      <slot name="item.actions" v-bind="props">
        <div v-if="actionType === 'edit-delete'">
          <a-icon-edit @click="$emit('click:edit', props.item)" />
          <a-icon-delete
            class="ml-2"
            @click="$emit('click:delete', props.item)"
          />
        </div>
        <div v-if="actionType === 'show-detail'">
          <a-icon-next @click="$emit('click:detail', props.item)" />
        </div>
      </slot>
    </template>
    <!-- ### FOOTER ### -->
    <!-- Show pagination if 'hidePagination' prop is false. -->
    <template v-if="!hidePagination" #footer="props">
      <slot name="footer" v-bind="props">
        <v-container fluid style="height: 76px">
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
