<script>
/**
 * ## pages.SitesIndex
 *
 * 現場情報の一覧ページです。
 *
 * - Sitesドキュメントの数が多いため、この画面では稼働中の現場のみを管理します。
 * - 稼働終了となった現場の管理機能は別コンポーネントで提供します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-09-06 - 初版作成
 */
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GInputSite from '~/components/molecules/inputs/GInputSite.vue'
import GDataTableSites from '~/components/molecules/tables/GDataTableSites.vue'
import GAutocompleteCustomer from '~/components/atoms/inputs/GAutocompleteCustomer.vue'
import Site from '~/models/Site'
import GEditModeMixin from '~/mixins/GEditModeMixin'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'SitesIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateIndex,
    GBtnRegistIcon,
    GInputSite,
    GDataTableSites,
    GAutocompleteCustomer,
    GDialogInput,
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
      dialog: false,
      instance: new Site(),
      // items: this.$store.getters['sites/items'],
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    items() {
      return this.$store.getters['sites/items'].filter(({ customerId }) => {
        return this.customerId ? customerId === this.customerId : true
      })
    },
    // filteredItems() {
    //   return this.items.filter(({ customerId }) => {
    //     return this.customerId ? customerId === this.customerId : true
    //   })
    // },
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
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {},
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickRow(item) {
      // 詳細ページが出来上がったらこちらを適用
      this.$router.push(`/sites/${item.docId}`)
      // this.instance.initialize(item)
      // this.editMode = this.UPDATE
      // this.dialog = true
    },
  },
}
</script>

<template>
  <g-template-index :items="items">
    <template #append-search>
      <g-dialog-input v-model="dialog">
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon color="primary" v-bind="attrs" v-on="on" />
        </template>
        <template #default="{ attrs, on }">
          <g-input-site
            v-bind="attrs"
            :edit-mode="editMode"
            :instance="instance"
            v-on="on"
          />
        </template>
      </g-dialog-input>
    </template>
    <template #nav>
      <g-autocomplete-customer
        v-model="customerId"
        label="取引先"
        clearable
        hide-details
      />
    </template>
    <template #default="{ attrs, search, on }">
      <g-data-table-sites
        v-bind="attrs"
        :search="search"
        @click:row="onClickRow"
        v-on="on"
      />
    </template>
  </g-template-index>
</template>

<style></style>
