<script>
/**
 * ### pages.SitesIndex
 * @author shisyamo4131
 * @update 2024-06-19   リアルタイムリスナーによる一覧表示に変更し、検索文字列がない場合にスポット現場を表示
 */
import { doc, getDoc, where } from 'firebase/firestore'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
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
      dialog: false,
      fetched: {
        customers: [],
      },
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
        this.subscribe()
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.model.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    subscribe() {
      const convert = async (data) => {
        const fetched = this.fetched.customers.find(
          ({ docId }) => docId === data.customerId
        )
        if (fetched) return { ...data, customer: fetched }
        const docRef = doc(this.$firestore, `Customers/${data.customerId}`)
        const snapshot = await getDoc(docRef)
        if (!snapshot.exists())
          throw new Error(
            'Could not find customer document. id:',
            data.customerId
          )
        this.fetched.customers.push(snapshot.data())
        return { ...data, customer: snapshot.data() }
      }
      const [ngram, constraints] = this.lazySearch
        ? [this.lazySearch, []]
        : [undefined, [where('temporary', '==', true)]]
      this.items = this.model.subscribe(ngram, constraints, convert)
    },
    initialize() {
      this.model.initialize()
    },
    onClickDetail(item) {
      this.$router.push(`/sites/${item.docId}`)
    },
    async submit() {
      this.loading = true
      try {
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
        @click:detail="onClickDetail"
      >
        <template #[`item.name`]="{ item }">
          <v-icon v-if="item.temporary" color="green darken-1" small left
            >mdi-exclamation-thick</v-icon
          >{{ `${item.temporary ? item.name : item.abbr}` }}
        </template>
      </g-data-table>
    </v-container>
  </div>
</template>

<style></style>
