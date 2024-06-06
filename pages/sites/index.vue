<script>
import { collection, getDocs, query, where } from 'firebase/firestore'
import GBtnRegistIcon from '~/components/molecules/btns/GBtnRegistIcon.vue'
import GInputSite from '~/components/molecules/inputs/GInputSite.vue'
import GTextFieldSearch from '~/components/molecules/inputs/GTextFieldSearch.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import GCardSubmitCancel from '~/components/molecules/cards/GCardSubmitCancel.vue'
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
    GCardSubmitCancel,
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
    },
    onClickDetail(item) {
      this.$router.push(`/sites/${item.docId}`)
    },
    async submit() {
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
        <g-card-submit-cancel
          :dialog.sync="dialog"
          label="現場"
          edit-mode="REGIST"
          :loading="loading"
          @click:submit="submit"
        >
          <g-input-site v-bind.sync="model" edit-mode="REGIST" />
        </g-card-submit-cancel>
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
