<script>
import { where } from 'firebase/firestore'
import GInputOperationResult from '~/components/molecules/inputs/GInputOperationResult.vue'
import GDataTableOperationResults from '~/components/molecules/tables/GDataTableOperationResults.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GDatePicker from '~/components/atoms/pickers/GDatePicker.vue'
/**
 * ### pages.operation-results.index
 * @author shisyamo4131
 */
export default {
  name: 'OperationResultsIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputOperationResult,
    GTemplateIndex,
    GDataTableOperationResults,
    GTextField,
    GDatePicker,
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
        // this.fetchDocs()
        const constraints = [where('month', '==', newVal)]
        this.items = this.model.subscribe(undefined, constraints)
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.model.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    // async fetchDocs() {
    //   const constraints = [where('month', '==', this.month)]
    //   this.loading = true
    //   this.items = await this.model.fetchDocs(undefined, constraints)
    //   this.loading = false
    // },
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
          <g-text-field
            v-bind="attrs"
            class="center-input"
            style="max-width: 120px"
            :value="$dayjs(`${month}-01`).format('YYYY年MM月')"
            hide-details
            readonly
            :loading="loading"
            v-on="on"
          />
        </template>
        <g-date-picker
          :value="month"
          type="month"
          @change="$refs.monthPicker.save($event)"
        />
      </v-menu>
      <v-spacer />
    </template>
    <template #search-drawer>
      <v-container> </v-container>
    </template>
    <template #data-table="{ attrs, on }">
      <g-data-table-operation-results v-bind="attrs" v-on="on" />
    </template>
  </g-template-index>
</template>

<style></style>
