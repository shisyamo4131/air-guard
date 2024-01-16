<template>
  <g-template-index label="取引先管理">
    <template #append-toolbar>
      <v-spacer />
      <v-toolbar-items>
        <v-dialog v-model="dialog" max-width="600">
          <template #activator="{ attrs, on }">
            <g-btn-regist v-bind="attrs" text v-on="on" />
          </template>
          <g-card-input-form
            ref="form"
            label="取引先"
            :loading="loading"
            @click:cancel="dialog = false"
            @click:submit="submit"
          >
            <template #default>
              <g-input-customer v-bind.sync="editItem" />
            </template>
          </g-card-input-form>
        </v-dialog>
      </v-toolbar-items>
    </template>
    <template #search-bar>
      <g-text-field-ngram-search
        collection-id="Customers"
        :items.sync="items"
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

<script>
import ASwitch from '~/components/atoms/inputs/ASwitch.vue'
import GBtnRegist from '~/components/molecules/btns/GBtnRegist.vue'
import GCardInputForm from '~/components/molecules/cards/GCardInputForm.vue'
import GInputCustomer from '~/components/molecules/inputs/GInputCustomer.vue'
import GDataTable from '~/components/molecules/tables/GDataTable.vue'
import GTextFieldNgramSearch from '~/components/organisms/GTextFieldNgramSearch.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
export default {
  components: {
    GCardInputForm,
    GBtnRegist,
    GInputCustomer,
    GDataTable,
    GTemplateIndex,
    ASwitch,
    GTextFieldNgramSearch,
  },
  data() {
    return {
      dialog: false,
      editItem: this.$Customer(),
      editMode: 'REGIST',
      items: [],
      loading: false,
      search: {
        bar: null,
        includeExpired: false,
      },
      // timerId: null,
    }
  },
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
  watch: {
    dialog(v) {
      if (v) return
      this.$refs.form.initialize()
      this.editItem.initialize()
      this.editMode = 'REGIST'
    },
    // 'search.bar'(v) {
    //   this.items.splice(0)
    //   clearTimeout(this.timerId)
    //   if (!v) return
    //   this.timerId = setTimeout(() => {
    //     this.fetch()
    //   }, 500)
    // },
  },
  methods: {
    // async fetch() {
    //   const result = await this.$store.dispatch('masters/fetch', {
    //     collectionId: 'Customers',
    //     search: this.search.bar,
    //   })
    //   this.items = result
    // },
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
