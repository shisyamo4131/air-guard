<script>
/**
 * # pages.CustomerIndex
 *
 * 取引先情報の一覧ページです。
 *
 * ## 注意事項
 * - Vuexで管理しているのは`status === 'active'`のもののみです。
 * - `status`が`active`以外のドキュメントは別途取得されます。
 *
 * @author shisyamo4131
 * @version 1.2.0
 *
 * @updates
 * - version 1.2.0 - 2024-07-25 - Vuex.customersの仕様変更に伴う修正。
 * - version 1.1.0 - 2024-07-02 - GDialogEditorの仕様変更に伴う改修。
 * - version 1.0.0 - 2024-xx-xx - 初版作成
 */
import { where } from 'firebase/firestore'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GInputCustomer from '~/components/molecules/inputs/GInputCustomer.vue'
import GDataTableCustomers from '~/components/molecules/tables/GDataTableCustomers.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GDialogEditor from '~/components/molecules/dialogs/GDialogEditor.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'CustomersIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GBtnRegistIcon,
    GInputCustomer,
    GDataTableCustomers,
    GTemplateIndex,
    GSwitch,
    GDialogEditor,
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: {
        active: this.$store.state.customers.items,
        inActive: [],
      },
      includeExpired: false,
      listener: this.$Customer(),
    }
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    includeExpired: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.subscribe()
      },
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.listener.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    subscribe() {
      this.items.inActive = this.listener.subscribe(undefined, [
        where('status', '!=', 'active'),
      ])
    },
  },
}
</script>

<template>
  <g-template-index extend :items="items.active.concat(items.inActive)">
    <template #append-search>
      <g-dialog-editor
        label="取引先"
        model-id="Customer"
        @submit:complete="$router.push(`/customers/${$event.item.docId}`)"
      >
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon color="primary" v-bind="attrs" v-on="on" />
        </template>
        <template #default="{ attrs, on }">
          <g-input-customer v-bind="attrs" v-on="on" />
        </template>
      </g-dialog-editor>
    </template>
    <template #extension>
      <g-switch
        v-model="includeExpired"
        label="取引終了を含める"
        hide-details
        :disabled="includeExpired"
      />
    </template>
    <template #default="{ attrs, on, search }">
      <g-data-table-customers
        v-bind="attrs"
        :search="search"
        sort-by="code"
        sort-desc
        @click:row="$router.push(`/customers/${$event.docId}`)"
        v-on="on"
      />
    </template>
  </g-template-index>
</template>

<style></style>
