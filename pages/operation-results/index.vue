<script>
import { where } from 'firebase/firestore'
import GInputOperationResult from '~/components/molecules/inputs/GInputOperationResult.vue'
import GDataTableOperationResults from '~/components/molecules/tables/GDataTableOperationResults.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import ATextField from '~/components/atoms/inputs/ATextField.vue'
import ADatePicker from '~/components/atoms/pickers/ADatePicker.vue'
import GAutocompleteCustomer from '~/components/molecules/inputs/GAutocompleteCustomer.vue'
import GAutocompleteSite from '~/components/molecules/inputs/GAutocompleteSite.vue'
/**
 * ### pages.operation-results.index
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputOperationResult,
    GTemplateIndex,
    GDataTableOperationResults,
    ATextField,
    ADatePicker,
    GAutocompleteCustomer,
    GAutocompleteSite,
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      customerId: '',
      siteId: '',
      items: [],
      loading: false,
      model: this.$OperationResult(),
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
        this.fetchDocs()
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async fetchDocs() {
      const constraints = [where('month', '==', this.month)]
      this.items = await this.model.fetchDocs(undefined, constraints)
    },
  },
}
</script>

<template>
  <g-template-index
    label="稼働実績管理"
    :items="filteredItems"
    :loading="loading"
    :model="model"
    regist-at-page
    :search-drawer-badge="!!customerId || !!siteId"
    use-search-drawer
  >
    <template #input="{ attrs, on }">
      <g-input-operation-result v-bind="attrs" v-on="on" />
    </template>
    <template #search-box>
      <v-menu
        ref="monthPicker"
        v-model="monthPicker"
        min-width="auto"
        :return-value.sync="month"
      >
        <template #activator="{ attrs, on }">
          <a-text-field
            v-bind="attrs"
            class="center-input"
            style="max-width: 120px"
            :value="$dayjs(`${month}-01`).format('YYYY年MM月')"
            hide-details
            readonly
            v-on="on"
          />
        </template>
        <a-date-picker
          :value="month"
          type="month"
          @change="$refs.monthPicker.save($event)"
        />
      </v-menu>
      <v-spacer />
    </template>
    <template #search-drawer>
      <v-container>
        <g-autocomplete-customer
          v-model="customerId"
          label="取引先"
          clearable
        />
        <g-autocomplete-site v-model="siteId" label="現場" clearable />
      </v-container>
    </template>
    <template #data-table="{ attrs, on }">
      <g-data-table-operation-results v-bind="attrs" v-on="on" />
    </template>
  </g-template-index>
</template>

<style></style>
