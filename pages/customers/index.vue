<script>
import { where } from 'firebase/firestore'
import GBtnRegistIcon from '~/components/molecules/btns/GBtnRegistIcon.vue'
import GInputCustomer from '~/components/molecules/inputs/GInputCustomer.vue'
import GTextFieldSearch from '~/components/molecules/inputs/GTextFieldSearch.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import GIconFavoriteCustomer from '~/components/molecules/icons/GIconFavoriteCustomer.vue'
import GCardSubmitCancel from '~/components/molecules/cards/GCardSubmitCancel.vue'
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
    GDataTable,
    GIconFavoriteCustomer,
    GCardSubmitCancel,
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
    },
    onClickDetail(item) {
      this.$router.push(`/customers/${item.docId}`)
    },
    async submit() {
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
    toggledFavorite(item) {
      item.favorite = !item.favorite
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
          label="取引先"
          edit-mode="REGIST"
          :loading="loading"
          @click:submit="submit"
        >
          <g-input-customer v-bind.sync="model" edit-mode="REGIST" />
        </g-card-submit-cancel>
      </v-dialog>
    </v-toolbar>
    <v-container fluid>
      <g-data-table
        :actions="['detail']"
        :headers="[
          { text: 'CODE', value: 'code', width: 84 },
          {
            text: 'お気に入り',
            value: 'favorite',
            width: 96,
            sortable: false,
            align: 'center',
          },
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
        <template #[`item.favorite`]="{ item }">
          <g-icon-favorite-customer
            :item="item"
            left
            small
            @toggled="toggledFavorite(item)"
          />
        </template>
        <template #[`item.abbr`]="{ item }">
          {{ item.abbr }}
        </template>
      </g-data-table>
    </v-container>
  </div>
</template>

<style></style>
