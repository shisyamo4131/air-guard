<script>
import { where } from 'firebase/firestore'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GInputEmployee from '~/components/molecules/inputs/GInputEmployee.vue'
import GTextFieldSearch from '~/components/molecules/inputs/GTextFieldSearch.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GCardSubmitCancel from '~/components/molecules/cards/GCardSubmitCancel.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'EmployeesIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextFieldSearch,
    GBtnRegistIcon,
    GInputEmployee,
    GDataTable,
    GSwitch,
    GCardSubmitCancel,
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      includesExpired: false,
      itemsExpired: [],
      loading: false,
      model: this.$Employee(),
      page: 1,
      pageCount: 0,
      search: null,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    items() {
      if (this.includesExpired) {
        return this.$store.state.employees.items.concat(this.itemsExpired)
      } else {
        return this.$store.state.employees.items
      }
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      v || this.initialize()
    },
    includesExpired(v) {
      !v || this.fetchExpired()
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async fetchExpired() {
      if (this.itemsExpired.length) return
      this.loading = true
      try {
        this.itemsExpired = await this.model.fetchDocs(undefined, [
          where('status', '==', 'expired'),
        ])
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
    initialize() {
      this.model.initialize()
    },
    onClickDetail(item) {
      this.$router.push(`/employees/${item.docId}`)
    },
    async submit() {
      // if (!this.validate()) return
      try {
        this.loading = true
        const docRef = await this.model.create()
        this.dialog = false
        this.$router.push(`/employees/${docRef.id}`)
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

<template>
  <div>
    <v-toolbar flat :color="$vuetify.theme.themes.light.background">
      <g-text-field-search v-model="search" />
      <v-dialog v-model="dialog" max-width="600" persistent scrollable>
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon color="primary" v-bind="attrs" v-on="on" />
        </template>
        <g-card-submit-cancel
          :dialog.sync="dialog"
          label="従業員"
          edit-mode="REGIST"
          :loading="loading"
          @click:submit="submit"
        >
          <g-input-employee v-bind.sync="model" edit-mode="REGIST" />
        </g-card-submit-cancel>
      </v-dialog>
      <template #extension>
        <div class="align-end">
          <g-switch
            v-model="includesExpired"
            hide-details
            label="退職者を含める"
          />
        </div>
      </template>
    </v-toolbar>
    <v-container fluid>
      <g-data-table
        :actions="['detail']"
        :headers="[
          { text: 'CODE', value: 'code', width: 84 },
          { text: '氏名', value: 'fullName' },
          { text: '住所', value: 'address1' },
        ]"
        :items="items"
        :loading="loading"
        no-data-text="該当する従業員が登録されていません。"
        no-results-text="該当する従業員が登録されていません。"
        :page.sync="page"
        :search="search"
        sort-by="code"
        sort-desc
        @click:detail="onClickDetail"
        @page-count="pageCount = $event"
      >
        <template #[`item.fullName`]="{ item }">
          <v-icon left :color="item.status === 'active' ? 'primary' : ''" small>
            {{ `mdi-account${item.status === 'active' ? '' : '-off'}` }}
          </v-icon>
          {{ item.fullName }}
        </template>
      </g-data-table>
    </v-container>
    <v-footer
      class="px-6"
      app
      :color="$vuetify.theme.themes.light.background"
      style="display: block"
    >
      <v-container>
        <v-pagination v-model="page" :length="pageCount" />
      </v-container>
    </v-footer>
  </div>
</template>

<style></style>
