<script>
/**
 * ## pages.OperationResultsIndex
 *
 * 稼働実績請求明細情報の一覧ページです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-10-02 - 初版作成
 */
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import OperationBillingBasis from '~/models/OperationBillingBasis'
import GEditModeMixin from '~/mixins/GEditModeMixin'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GDialogMonthPicker from '~/components/molecules/dialogs/GDialogMonthPicker.vue'
import GDataTableOperationBillingBases from '~/components/molecules/tables/GDataTableOperationBillingBases.vue'
import GInputOperationBillingBasis from '~/components/molecules/inputs/GInputOperationBillingBasis.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'OperationBillingBasesIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateIndex,
    GDialogInput,
    GBtnRegistIcon,
    GDialogMonthPicker,
    GDataTableOperationBillingBases,
    GInputOperationBillingBasis,
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
      instance: new OperationBillingBasis(),
      items: [],
      month: this.$dayjs().format('YYYY-MM'),
      monthPicker: false,
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
  <g-template-index :items="filteredItems">
    <template #search>
      <g-dialog-month-picker v-model="month">
        <template #activator="{ attrs, on }">
          <v-text-field
            v-bind="attrs"
            class="center-input"
            style="max-width: 120px"
            flat
            solo-inverted
            dense
            hide-details
            v-on="on"
          />
        </template>
      </g-dialog-month-picker>
      <v-spacer />
    </template>
    <template #append-search>
      <g-dialog-input v-model="dialog" fullscreen>
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon color="primary" v-bind="attrs" v-on="on" />
        </template>
        <template #default="{ attrs, on }">
          <g-input-operation-billing-basis
            v-bind="attrs"
            :edit-mode="editMode"
            :instance="instance"
            v-on="on"
          />
        </template>
      </g-dialog-input>
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-operation-billing-bases
        v-bind="attrs"
        @click:row="onClickRow"
        v-on="on"
      />
    </template>
  </g-template-index>
</template>

<style></style>
