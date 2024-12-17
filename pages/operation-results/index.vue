<script>
/**
 * 稼働実績情報の一覧ページです。
 * @author shisyamo4131
 */
import GInputOperationResult from '~/components/molecules/inputs/GInputOperationResult.vue'
import GDataTableOperationResults from '~/components/molecules/tables/GDataTableOperationResults.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import OperationResult from '~/models/OperationResult'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GTextFieldMonth from '~/components/molecules/inputs/GTextFieldMonth.vue'
import GAutocompleteCustomer from '~/components/atoms/inputs/GAutocompleteCustomer.vue'
import GAutocompleteSite from '~/components/atoms/inputs/GAutocompleteSite.vue'
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
    GTextFieldMonth,
    GAutocompleteCustomer,
    GAutocompleteSite,
  },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeProvider],

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      instance: new OperationResult(),
      items: [],
      month: this.$dayjs().format('YYYY-MM'),
      selectedCustomerId: null,
      selectedSiteId: null,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * 読み込まれた稼働実績ドキュメントを返します。
     * - 取引先ID, 現場IDでの絞り込みを行います。
     */
    filteredItems() {
      return this.items
        .filter((item) => {
          return this.selectedCustomerId
            ? item.site.customer.docId === this.selectedCustomerId
            : true
        })
        .filter((item) => {
          return this.selectedSiteId
            ? item.site.docId === this.selectedSiteId
            : true
        })
    },

    /**
     * 読み込まれた稼働実績ドキュメントの取引先IDの配列を返します。
     */
    customerIds() {
      return [...new Set(this.items.map((item) => item.site.customerId))]
    },

    /**
     * 読み込まれた稼働実績ドキュメントの現場IDの配列を返します。
     * - 取引先IDで絞り込まれているケースに対応しています。
     */
    siteIds() {
      return [
        ...new Set(
          this.items
            .filter((item) => {
              return (
                !this.selectedCustomerId ||
                item.site.customer.docId === this.selectedCustomerId
              )
            })
            .map((item) => item.site.docId)
        ),
      ]
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
      handler(v) {
        const constraints = [['where', 'month', '==', v]]
        this.items = this.instance.subscribeDocs(constraints)
      },
      immediate: true,
    },

    selectedCustomerId(v) {
      this.selectedSiteId = null
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
    onClickSearchClear() {
      this.selectedCustomerId = null
      this.selectedSiteId = null
    },

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
  <g-template-index
    label="稼働実績管理"
    :items="filteredItems"
    @click:clear="onClickSearchClear"
  >
    <template #nav>
      <g-autocomplete-customer
        v-model="selectedCustomerId"
        clearable
        :doc-ids="customerIds"
      />
      <g-autocomplete-site
        v-model="selectedSiteId"
        clearable
        :doc-ids="siteIds"
      />
    </template>
    <template #search="{ attrs }">
      <g-text-field-month v-model="month" :options="attrs" />
      <v-spacer />
    </template>
    <template #append-search>
      <g-dialog-input v-model="dialog" :edit-mode.sync="editMode" fullscreen>
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon color="primary" v-bind="attrs" v-on="on" />
        </template>
        <template #default="{ attrs, on }">
          <g-input-operation-result
            v-bind="attrs"
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
