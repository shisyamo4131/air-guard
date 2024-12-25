<script>
/**
 * 現場情報の一覧ページです。
 * @author shisyamo4131
 */
import GDataTableSites from '~/components/molecules/tables/GDataTableSites.vue'
import GAutocompleteCustomer from '~/components/atoms/inputs/GAutocompleteCustomer.vue'
import Site from '~/models/Site'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GTemplateDocumentsIndex from '~/components/templates/GTemplateDocumentsIndex.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'SitesIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTableSites,
    GAutocompleteCustomer,
    GSwitch,
    GTemplateDocumentsIndex,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      customerId: '',
      instance: new Site(),
      includeExpired: false,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    items() {
      return this.$store.getters['sites/items'].filter(
        ({ customerId, status }) => {
          const customerMatch = this.customerId
            ? customerId === this.customerId
            : true
          const includeExpiredMatch = this.includeExpired || status === 'active'
          return customerMatch && includeExpiredMatch
        }
      )
    },
  },
}
</script>

<template>
  <g-template-documents-index
    label="現場管理"
    :items="items"
    :instance="instance"
    :edit-event-handler="(item) => $router.push(`sites/${item.docId}`)"
  >
    <template #nav>
      <g-autocomplete-customer
        v-model="customerId"
        label="取引先"
        clearable
        attach
      />
      <g-switch v-model="includeExpired" label="稼働終了を含める" />
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-sites v-bind="attrs" v-on="on" />
    </template>
  </g-template-documents-index>
</template>

<style></style>
