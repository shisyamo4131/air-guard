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
 * @version 1.0.0
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
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app }) {
    const recent = {
      items: [],
      listener: app.$Site(),
    }
    recent.items = recent.listener.subscribe(undefined, [
      orderBy('code', 'desc'),
      limit(10),
    ])
    return { recent }
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      fetched: {
        items: [],
        listener: this.$Site(),
      },
      model: this.$Site(),
      search: {
        customerId: '',
        includeExpired: false,
        value: null,
      },
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    filteredItems() {
      return this.fetched.items.filter((item) => {
        const customerId = this.search.customerId
        const isActive = this.search.includeExpired || item.status === 'active'
        const isCustomerMatch =
          !customerId || item.customer.docId === customerId
        return isActive && isCustomerMatch
      })
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    'search.value': {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.subscribe()
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  destroyed() {
    this.fetched.listener.unsubscribe()
    this.recent.listener.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    subscribe() {
      if (!this.search.value) return
      this.fetched.items = this.fetched.listener.subscribe(this.search.value)
    },
  },
}
</script>

<template>
  <g-template-index
    extend
    :items="search.value ? filteredItems : recent.items"
    :lazy-search.sync="search.value"
  >
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
      <div v-if="!search.value" class="flex-grow-1">
        <v-alert class="mb-0" dense type="info" text
          >最新の10件を表示しています。</v-alert
        >
      </div>
      <div
        v-else
        class="d-flex align-center flex-nowrap flex-grow-1"
        style="gap: 12px"
      >
        <g-autocomplete-customer
          v-model="search.customerId"
          class="flex-grow-1"
          clearable
          solo-inverted
          flat
          :outlined="false"
          hide-details
          placeholder="取引先"
        />
        <g-switch
          v-model="search.includeExpired"
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
