<script>
/**
 * 稼働実績請求明細情報の一覧ページです。
 * @author shisyamo4131
 */
import OperationBillingBasis from '~/models/OperationBillingBasis'
import GDataTableOperationBillingBases from '~/components/molecules/tables/GDataTableOperationBillingBases.vue'
import GInputOperationBillingBasis from '~/components/molecules/inputs/GInputOperationBillingBasis.vue'
import GTextFieldMonth from '~/components/molecules/inputs/GTextFieldMonth.vue'
import GTemplateDocumentsIndex from '~/components/templates/GTemplateDocumentsIndex.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'OperationBillingBasesIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTableOperationBillingBases,
    GInputOperationBillingBasis,
    GTextFieldMonth,
    GTemplateDocumentsIndex,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      customerId: '',
      siteId: '',
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
}
</script>

<template>
  <g-template-documents-index
    label="取引先請求情報"
    :items="filteredItems"
    :instance="instance"
    :dialog-props="{ fullscreen: true }"
  >
    <template #input="{ attrs, on }">
      <g-input-operation-billing-basis v-bind="attrs" v-on="on" />
    </template>
    <template #search="{ attrs, inputAttrs }">
      <g-text-field-month
        v-model="month"
        :options="{ ...attrs, ...inputAttrs }"
      />
      <v-spacer />
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-operation-billing-bases v-bind="attrs" v-on="on" />
    </template>
  </g-template-documents-index>
</template>

<style></style>
