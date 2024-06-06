<script>
import { collection, getDocs, query, where } from 'firebase/firestore'
import GBtnRegistIcon from '~/components/molecules/btns/GBtnRegistIcon.vue'
import GInputSite from '~/components/molecules/inputs/GInputSite.vue'
import GTextFieldSearch from '~/components/molecules/inputs/GTextFieldSearch.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import GBtnCancelIcon from '~/components/molecules/btns/GBtnCancelIcon.vue'
import GBtnSubmitIcon from '~/components/molecules/btns/GBtnSubmitIcon.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'SitesIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextFieldSearch,
    GBtnRegistIcon,
    GInputSite,
    GDataTable,
    GBtnCancelIcon,
    GBtnSubmitIcon,
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      customers: [],
      dialog: false,
      items: [],
      lazySearch: null,
      loading: false,
      model: this.$Site(),
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
    async fetchCustomers(sites) {
      const newCustomerIds = [
        ...new Set(sites.map((item) => item.customerId)),
      ].filter(
        (id) => !this.customers.some((customer) => customer.docId === id)
      )

      const chunkedIds = newCustomerIds.flatMap((_, i, arr) =>
        i % 30 ? [] : [arr.slice(i, i + 30)]
      )
      const promises = chunkedIds.map(async (ids) => {
        const colRef = collection(this.$firestore, 'Customers')
        const q = query(colRef, where('docId', 'in', ids))
        const querySnapshot = await getDocs(q)
        return querySnapshot.docs.map((doc) => doc.data())
      })

      const querySnapshots = await Promise.all(promises)
      querySnapshots.forEach((data) => this.customers.push(...data))
    },
    async fetchDocs() {
      this.items.splice(0)
      this.loading = true
      try {
        const ngram = this.lazySearch || undefined
        const constraints = this.lazySearch
          ? []
          : [where('favorite', '==', true)]
        const fetchedItems = await this.model.fetchDocs(ngram, constraints)
        if (!fetchedItems.length) return
        await this.fetchCustomers(fetchedItems)
        fetchedItems.forEach((item) => {
          item.customer = this.customers.find(
            (customer) => customer.docId === item.customerId
          )
        })
        this.items = fetchedItems
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
      this.$router.push(`/sites/${item.docId}`)
    },
    async submit() {
      if (!this.validate()) return
      try {
        this.loading = true
        const docRef = await this.model.create()
        this.dialog = false
        this.$router.push(`/sites/${docRef.id}`)
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
            <v-toolbar-title>現場[登録]</v-toolbar-title>
          </v-toolbar>
          <v-card-text :ref="(el) => (scrollTarget = el)" class="pa-4">
            <v-form ref="form" :disabled="loading">
              <g-input-site v-bind.sync="model" edit-mode="REGIST" />
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-space-between">
            <g-btn-cancel-icon :disabled="loading" @click="dialog = false" />
            <g-btn-submit-icon
              :disabled="loading"
              :loading="loading"
              color="primary"
              @click="submit"
            />
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>
    <v-container fluid>
      <g-data-table
        :actions="['detail']"
        :headers="[
          { text: 'CODE', value: 'code', width: 84 },
          { text: '取引先', value: 'customer.abbr' },
          { text: '現場名', value: 'name' },
          { text: '住所', value: 'address' },
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
        <template #[`item.name`]="{ item }">
          <v-icon v-if="item.favorite" color="yellow darken-2" small left
            >mdi-star</v-icon
          >{{ item.abbr }}
        </template>
      </g-data-table>
    </v-container>
  </div>
</template>

<style></style>
