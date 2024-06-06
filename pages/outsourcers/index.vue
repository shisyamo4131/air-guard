<script>
import GBtnRegistIcon from '~/components/molecules/btns/GBtnRegistIcon.vue'
import GInputOutsourcer from '~/components/molecules/inputs/GInputOutsourcer.vue'
import GTextFieldSearch from '~/components/molecules/inputs/GTextFieldSearch.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import GCardSubmitCancel from '~/components/molecules/cards/GCardSubmitCancel.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'OutsourcersIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextFieldSearch,
    GBtnRegistIcon,
    GInputOutsourcer,
    GDataTable,
    GCardSubmitCancel,
  },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app }) {
    const model = app.$Outsourcer()
    const items = model.subscribe()
    return { model, items }
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      loading: false,
      search: null,
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
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    initialize() {
      this.model.initialize()
    },
    onClickDetail(item) {
      this.$router.push(`/outsourcers/${item.docId}`)
    },
    async submit() {
      try {
        this.loading = true
        const docRef = await this.model.create()
        this.dialog = false
        this.$router.push(`/outsourcers/${docRef.id}`)
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
          label="外注先"
          edit-mode="REGIST"
          :loading="loading"
          @click:submit="submit"
        >
          <g-input-outsourcer v-bind.sync="model" edit-mode="REGIST" />
        </g-card-submit-cancel>
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
        :search="search"
        @click:detail="onClickDetail"
      >
        <template #[`item.abbr`]="{ item }">
          {{ item.abbr }}
        </template>
      </g-data-table>
    </v-container>
  </div>
</template>

<style></style>
