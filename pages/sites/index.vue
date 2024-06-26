<script>
/**
 * ### pages.SitesIndex
 *
 * 現場情報の一覧ページです。
 * 現場情報（Sites）はドキュメント数が膨大になるため、ユーザーの入力した検索条件に該当するものを
 * Firestoreから都度取得します。
 * 検索条件が未入力の場合、最新の10件を表示します。
 *
 * @author shisyamo4131
 * @create 2024-06-26
 */
import { limit, orderBy } from 'firebase/firestore'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GInputSite from '~/components/molecules/inputs/GInputSite.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GDialogEditorSite from '~/components/molecules/dialogs/GDialogEditorSite.vue'
import GDataTableSites from '~/components/molecules/tables/GDataTableSites.vue'
import GAutocompleteCustomer from '~/components/atoms/inputs/GAutocompleteCustomer.vue'
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
    GSwitch,
    GDialogEditorSite,
    GDataTableSites,
    GAutocompleteCustomer,
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      customerId: '',
      includeExpired: false,
      items: [],
      model: this.$Site(),
      search: null,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    filteredItems() {
      return this.items
        .filter((item) => this.includeExpired || item.status === 'active')
        .filter(
          (item) => !this.customerId || item.customer.docId === this.customerId
        )
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    search: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.subscribe()
      },
      immediate: true,
    },
  },
  activated() {
    console.log('activated')
  },
  deactivated() {
    console.log('deactivated')
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  destroyed() {
    this.model.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    subscribe() {
      this.loading = true
      if (!this.search) {
        this.items = this.model.subscribe(undefined, [
          orderBy('code', 'desc'),
          limit(10),
        ])
      } else {
        this.items = this.model.subscribe(this.search)
      }
    },
  },
}
</script>

<template>
  <g-template-index extend :items="filteredItems" :lazy-search.sync="search">
    <template #append-search>
      <g-dialog-editor-site
        @submit:complete="$router.push(`/sites/${$event.item.docId}`)"
      >
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon color="primary" v-bind="attrs" v-on="on" />
        </template>
        <template #default="{ attrs, on }">
          <g-input-site v-bind="attrs" v-on="on" />
        </template>
      </g-dialog-editor-site>
    </template>
    <template #extension>
      <div
        class="d-flex align-center flex-nowrap flex-grow-1"
        style="gap: 12px"
      >
        <g-autocomplete-customer
          v-model="customerId"
          class="flex-grow-1"
          clearable
          solo-inverted
          flat
          :outlined="false"
          hide-details
          placeholder="取引先"
        />
        <g-switch
          v-model="includeExpired"
          class="flex-grow-0"
          label="稼働終了を含める"
          hide-details
        />
      </div>
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-sites
        v-bind="attrs"
        sort-by="code"
        sort-desc
        @click:row="$router.push(`/sites/${$event.docId}`)"
        v-on="on"
      />
    </template>
  </g-template-index>
</template>

<style></style>
