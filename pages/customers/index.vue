<script>
/**
 * ### pages.CustomerIndex
 *
 * 取引先情報の一覧ページです。
 * 取引先情報（Customers）はVuexから取得します。
 *
 * @author shisyamo4131
 * @create
 * @version 1.1.0
 *
 * 更新履歴:
 * version 1.1.0 - 2024-07-02
 *  - GDialogEditorの仕様変更に伴う改修。
 */
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
      includeExpired: false,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    items() {
      return this.$store.state.customers.items.filter(
        (item) => !this.includeExpired || item.status === 'active'
      )
    },
  },
}
</script>

<template>
  <g-template-index extend :items="items">
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
