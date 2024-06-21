<script>
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GTextFieldSearch from '~/components/molecules/inputs/GTextFieldSearch.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import GCardSubmitCancel from '~/components/molecules/cards/GCardSubmitCancel.vue'
import GInputAutonumber from '~/components/molecules/inputs/GInputAutonumber.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'AutonumbersIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextFieldSearch,
    GBtnRegistIcon,
    GDataTable,
    GCardSubmitCancel,
    GInputAutonumber,
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  asyncData({ app }) {
    const model = app.$Autonumber()
    const items = model.subscribe()
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
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.model.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    initialize() {
      this.model.initialize()
      this.editMode = 'REGIST'
    },
    onClickEdit(item) {
      this.model.initialize(item)
      this.editMode = 'UPDATE'
      this.dialog = true
    },
    onClickDelete(item) {
      this.model.initialize(item)
      this.editMode = 'DELETE'
      this.dialog = true
    },
    async submit() {
      this.loading = true
      try {
        if (this.editMode === 'REGIST') await this.model.create()
        if (this.editMode === 'UPDATE') await this.model.update()
        if (this.editMode === 'DELETE') await this.model.delete()
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
          label="自動採番"
          :edit-mode="editMode"
          :loading="loading"
          @click:submit="submit"
        >
          <g-input-autonumber v-bind.sync="model" :edit-mode="editMode" />
        </g-card-submit-cancel>
      </v-dialog>
    </v-toolbar>
    <v-container fluid>
      <g-data-table
        :actions="['edit', 'delete']"
        :headers="[
          { text: 'コレクション名', value: 'collectionId' },
          { text: '現在値', value: 'current' },
          { text: '桁数', value: 'length' },
          { text: 'フィールド名', value: 'field' },
          { text: '状態', value: 'status' },
        ]"
        :items="items"
        sort-by="collectionId"
        @click:edit="onClickEdit"
        @click:delete="onClickDelete"
      >
      </g-data-table>
    </v-container>
  </div>
</template>

<style></style>
