<script>
import { where } from 'firebase/firestore'
import GIconClose from '~/components/atoms/icons/GIconClose.vue'
import GIconSubmit from '~/components/atoms/icons/GIconSubmit.vue'
import GBtnRegistIcon from '~/components/molecules/btns/GBtnRegistIcon.vue'
import GInputCustomer from '~/components/molecules/inputs/GInputCustomer.vue'
import GTextFieldSearch from '~/components/molecules/inputs/GTextFieldSearch.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'CustomersIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextFieldSearch,
    GBtnRegistIcon,
    GInputCustomer,
    GIconSubmit,
    GIconClose,
    GDataTable,
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      items: [],
      lazySearch: null,
      loading: false,
      model: this.$Customer(),
      scrollTarget: null,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {},
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      v || this.initialize()
    },
    lazySearch: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.fetchDocs()
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async fetchDocs() {
      this.items.splice(0)
      try {
        this.loading = true
        const ngram = this.lazySearch || undefined
        const constraints = this.lazySearch
          ? []
          : [where('favorite', '==', true)]
        this.items = await this.model.fetchDocs(ngram, constraints)
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
      this.$refs.form.resetValidation()
      if (!this.scrollTarget) return
      this.scrollTarget.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    },
    onClickDetail(item) {
      this.$router.push(`/customers/${item.docId}`)
    },
    async submit() {
      if (!this.validate()) return
      try {
        this.loading = true
        const docRef = await this.model.create()
        this.dialog = false
        this.$router.push(`/customers/${docRef.id}`)
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
    validate() {
      const result = this.$refs.form.validate()
      if (!result) alert('入力に不備があります。')
      return result
    },
  },
}
</script>

<template>
  <div>
    <v-toolbar flat :color="$vuetify.theme.themes.light.background">
      <g-text-field-search :lazy-value.sync="lazySearch" />
      <v-dialog v-model="dialog" max-width="600" persistent scrollable>
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon color="primary" v-bind="attrs" v-on="on" />
        </template>
        <v-card>
          <v-toolbar dense flat color="primary" dark>
            <v-toolbar-title>取引先[登録]</v-toolbar-title>
          </v-toolbar>
          <v-card-text :ref="(el) => (scrollTarget = el)" class="pa-4">
            <v-form ref="form" :disabled="loading">
              <g-input-customer v-bind.sync="model" edit-mode="REGIST" />
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-space-between">
            <v-btn :disabled="loading" @click="dialog = false"
              ><g-icon-close />close</v-btn
            >
            <v-btn
              :disabled="loading"
              :loading="loading"
              color="primary"
              @click="submit"
              ><g-icon-submit />submit</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>
    <v-container fluid>
      <g-data-table
        :actions="['detail']"
        :headers="[
          { text: 'CODE', value: 'code', width: 84 },
          { text: '略称', value: 'abbr' },
          { text: '住所', value: 'address1' },
        ]"
        :items="items"
        :loading="loading"
        :no-data-text="
          lazySearch
            ? '該当する現場が登録されていません。'
            : 'お気に入りに登録されている現場がありません。'
        "
        @click:detail="onClickDetail"
      >
        <template #[`item.abbr`]="{ item }">
          <v-icon v-if="item.favorite" color="yellow darken-2" small left
            >mdi-star</v-icon
          >{{ item.abbr }}
        </template>
      </g-data-table>
    </v-container>
  </div>
</template>

<style></style>
