<script>
/**
 * ## pages.OperationResultsIndex
 *
 * 稼働実績情報の一覧ページです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-09-06 - 初版作成
 */
import GInputOperationResult from '~/components/molecules/inputs/GInputOperationResult.vue'
import GDataTableOperationResults from '~/components/molecules/tables/GDataTableOperationResults.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import OperationResult from '~/models/OperationResult'
import GEditModeMixin from '~/mixins/GEditModeMixin'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GTextFieldSearchMonth from '~/components/molecules/inputs/GTextFieldSearchMonth.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'OperationResultsIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputOperationResult,
    GTemplateIndex,
    GDataTableOperationResults,
    GDialogInput,
    GBtnRegistIcon,
    GTextFieldSearchMonth,
  },
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GEditModeMixin],
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      customerId: '',
      siteId: '',
      dialog: false,
      instance: new OperationResult(),
      items: [],
      month: this.$dayjs().format('YYYY-MM'),
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    filteredItems() {
      return this.items
        .filter((item) => {
          return this.customerId
            ? item.site.customer.docId === this.customerId
            : true
        })
        .filter((item) => {
          return this.siteId ? item.site.docId === this.siteId : true
        })
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      if (!v) {
        this.instance.initialize()
        this.editMode = this.CREATE
      }
    },
    month: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        const constraints = [['where', 'month', '==', newVal]]
        this.items = this.instance.subscribeDocs(constraints)
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.instance.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickRow(item) {
      // 詳細ページが出来上がったらこちらを適用
      // this.$router.push(`/customers/${item.docId}`)
      this.instance.initialize(item)
      this.editMode = this.UPDATE
      this.dialog = true
    },
  },
}
</script>

<template>
  <g-template-index label="稼働実績管理" :items="filteredItems">
    <template #search>
      <g-text-field-search-month v-model="month" />
      <v-spacer />
    </template>
    <template #append-search>
      <g-dialog-input v-model="dialog" fullscreen>
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon color="primary" v-bind="attrs" v-on="on" />
        </template>
        <template #default="{ attrs, on }">
          <g-input-operation-result
            v-bind="attrs"
            :edit-mode="editMode"
            :instance="instance"
            tile
            v-on="on"
          />
        </template>
      </g-dialog-input>
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-operation-results
        v-bind="attrs"
        @click:row="onClickRow"
        v-on="on"
      />
    </template>
  </g-template-index>
</template>

<style></style>
