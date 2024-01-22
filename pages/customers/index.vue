<script>
import ASwitch from '~/components/atoms/inputs/ASwitch.vue'
import ARenderlessCrud from '~/components/atoms/renderless/ARenderlessCrud.vue'
import GCardInputForm from '~/components/molecules/cards/GCardInputForm.vue'
import GInputCustomer from '~/components/molecules/inputs/GInputCustomer.vue'
import GTextFieldSearch from '~/components/molecules/inputs/GTextFieldSearch.vue'
import GDataTable from '~/components/molecules/tables/GDataTable.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
/**
 * ### pages.customers.index
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GCardInputForm,
    GInputCustomer,
    GDataTable,
    GTemplateIndex,
    ASwitch,
    GTextFieldSearch,
    ARenderlessCrud,
  },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app }) {
    const model = app.$Customer()
    const items = model.items
    return { model, items }
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      editMode: 'REGIST',
      loading: false,
      search: {
        includeExpired: false,
        lazyValue: null,
        value: null,
      },
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      return [
        { text: 'CODE', value: 'code' },
        { text: '取引先名1', value: 'name1' },
        { text: '取引先名2', value: 'name2' },
        { text: '状態', value: 'status', sortable: false },
      ]
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      if (v) return
      this.editMode = 'REGIST'
      this.$refs.form.initialize()
      this.model.initialize()
    },
    'search.lazyValue'(v) {
      this.model.unsubscribe()
      !v || this.model.subscribe(v)
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    openEditor(item, mode) {
      this.editMode = mode
      this.model.initialize(item)
      this.dialog = true
    },
  },
}
</script>

<template>
  <g-template-index label="取引先管理">
    <template #append-toolbar>
      <v-spacer />
      <v-toolbar-items>
        <v-dialog v-model="dialog" max-width="600">
          <template #activator="{ attrs, on }">
            <v-btn v-bind="attrs" icon v-on="on"
              ><v-icon>mdi-plus</v-icon></v-btn
            >
          </template>
          <a-renderless-crud
            :edit-mode="editMode"
            :model="model"
            @cancel="dialog = false"
            @submit:complete="dialog = false"
          >
            <template #default="{ attrs, on }">
              <g-card-input-form
                ref="form"
                label="取引先"
                v-bind="attrs"
                v-on="on"
              >
                <g-input-customer v-bind.sync="model" />
              </g-card-input-form>
            </template>
          </a-renderless-crud>
        </v-dialog>
      </v-toolbar-items>
    </template>
    <template #search-bar>
      <g-text-field-search
        v-model="search.value"
        :lazy-value.sync="search.lazyValue"
      />
      <a-switch
        v-model="search.includeExpired"
        class="ml-2"
        hide-details
        label="契約終了も表示する"
      />
    </template>
    <template #default="{ height }">
      <v-container fluid>
        <g-data-table
          :headers="headers"
          :items="items"
          :height="height - 24"
          show-actions
          sort-by="code"
          sort-desc
          @click:edit="openEditor($event, 'UPDATE')"
          @click:delete="openEditor($event, 'DELETE')"
        >
          <template #[`item.status`]="{ item }">
            {{ $CUSTOMER_STATUS[item.status] }}
          </template>
        </g-data-table>
      </v-container>
    </template>
  </g-template-index>
</template>

<style></style>
