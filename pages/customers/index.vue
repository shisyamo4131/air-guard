<script>
/**
 * 取引先情報の一覧ページです。
 * @author shisyamo4131
 */
import GInputCustomer from '~/components/molecules/inputs/GInputCustomer.vue'
import GDataTableCustomers from '~/components/molecules/tables/GDataTableCustomers.vue'
import GTemplateDocumentsIndex from '~/components/templates/GTemplateDocumentsIndex.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import Customer from '~/models/Customer'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'CustomersIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputCustomer,
    GDataTableCustomers,
    GTemplateDocumentsIndex,
    GSwitch,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      instance: new Customer(),
      includeExpired: false,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    items() {
      return this.$store.getters['customers/items'].filter(({ status }) => {
        return this.includeExpired || status === 'active'
      })
    },
  },
}
</script>

<template>
  <g-template-documents-index
    label="取引先管理"
    :items="items"
    :instance="instance"
  >
    <template #input="{ attrs, on }">
      <g-input-customer v-bind="attrs" v-on="on" />
    </template>
    <template #nav>
      <g-switch v-model="includeExpired" label="取引終了を含める" />
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-customers
        v-bind="attrs"
        sort-by="code"
        sort-desc
        v-on="on"
      />
    </template>
  </g-template-documents-index>
</template>

<style></style>
