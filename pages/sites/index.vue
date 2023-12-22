<template>
  <g-template-default label="現場管理">
    <template #append-toolbar-title>
      <v-spacer />
      <v-toolbar-items>
        <v-dialog v-model="dialog" max-width="600">
          <template #activator="{ attrs, on }">
            <g-btn-regist v-bind="attrs" text v-on="on" />
          </template>
          <g-card-input-form
            ref="form"
            label="現場"
            :edit-mode="editMode"
            :loading="loading"
            @click:cancel="dialog = false"
            @click:submit="submit"
          >
            <template #default>
              <g-input-site v-bind.sync="editItem" :edit-mode="editMode" />
            </template>
          </g-card-input-form>
        </v-dialog>
      </v-toolbar-items>
    </template>
    <template #default="{ height }">
      <v-container fluid>
        <v-toolbar flat>
          <a-text-field-search v-model="search.bar" />
          <g-autocomplete-customer
            v-model="search.customerId"
            class="ml-2"
            :items="$store.getters['masters/Customers']"
            clearable
            flat
            hide-details
            :outlined="false"
            placeholder="取引先"
            prepend-inner-icon="mdi-magnify"
            solo-inverted
          />
          <a-switch
            v-model="search.includeExpired"
            class="ml-2"
            hide-details
            label="終了現場も表示する"
          />
        </v-toolbar>
        <g-data-table
          :headers="headers"
          :items="items"
          :height="height - 24 - toolbarHeight"
          :search="search.bar"
          show-actions
          sort-by="code"
          sort-desc
          @click:edit="openEditor($event, 'UPDATE')"
          @click:delete="openEditor($event, 'DELETE')"
        >
          <template #[`item.customerId`]="{ item }">
            {{ $store.getters['masters/Customer'](item.customerId).abbr }}
          </template>
          <template #[`item.status`]="{ item }">
            {{ $SITE_STATUS[item.status] }}
          </template>
        </g-data-table>
      </v-container>
    </template>
  </g-template-default>
</template>

<script>
import ASwitch from '~/components/atoms/inputs/ASwitch.vue'
import ATextFieldSearch from '~/components/atoms/inputs/ATextFieldSearch.vue'
import GBtnRegist from '~/components/molecules/btns/GBtnRegist.vue'
import GCardInputForm from '~/components/molecules/cards/GCardInputForm.vue'
import GAutocompleteCustomer from '~/components/molecules/inputs/GAutocompleteCustomer.vue'
import GInputSite from '~/components/molecules/inputs/GInputSite.vue'
import GDataTable from '~/components/molecules/tables/GDataTable.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  components: {
    GTemplateDefault,
    GCardInputForm,
    GBtnRegist,
    GInputSite,
    GDataTable,
    ATextFieldSearch,
    ASwitch,
    GAutocompleteCustomer,
  },
  data() {
    return {
      dialog: false,
      editItem: this.$Site(),
      editMode: 'REGIST',
      loading: false,
      search: {
        bar: null,
        includeExpired: false,
        customerId: null,
      },
    }
  },
  computed: {
    headers() {
      return [
        { text: 'CODE', value: 'code' },
        { text: '現場名', value: 'name' },
        { text: '住所', value: 'address', sortable: false },
        { text: '取引先', value: 'customerId', sortable: false },
        { text: '状態', value: 'status' },
      ]
    },
    items() {
      return this.$store.getters['masters/Sites']
        .filter(({ status }) => {
          if (this.search.includeExpired) return true
          return status === 'active'
        })
        .filter(({ customerId }) => {
          if (!this.search.customerId) return true
          return customerId === this.search.customerId
        })
    },
    toolbarHeight() {
      if (this.$vuetify.breakpoint.mobile) return 56
      return 64
    },
  },
  watch: {
    dialog(v) {
      if (v) return
      this.$refs.form.initialize()
      this.editItem.initialize()
      this.editMode = 'REGIST'
    },
  },
  methods: {
    openEditor(item, mode) {
      this.editItem.initialize(item)
      this.editMode = mode
      this.dialog = true
    },
    async submit() {
      try {
        this.loading = true
        if (this.editMode === 'REGIST') await this.editItem.create()
        if (this.editMode === 'UPDATE') await this.editItem.update()
        if (this.editMode === 'DELETE') await this.editItem.delete()
        this.dialog = false
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style></style>
