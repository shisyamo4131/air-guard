<script>
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import GBtnRegistIcon from '~/components/molecules/btns/GBtnRegistIcon.vue'
import GInputEquipment from '~/components/molecules/inputs/GInputEquipment.vue'
import GTextFieldSearch from '~/components/molecules/inputs/GTextFieldSearch.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import GCardSubmitCancel from '~/components/molecules/cards/GCardSubmitCancel.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'EquipmentsIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextFieldSearch,
    GBtnRegistIcon,
    GInputEquipment,
    GDataTable,
    GCardSubmitCancel,
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      editMode: 'REGIST',
      items: [],
      listener: null,
      loading: false,
      model: this.$Equipment(),
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
   * MOUNTED
   ***************************************************************************/
  mounted() {
    this.subscribe()
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    if (this.listener) this.listener()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async getEquipmentRecords(equipmentId, date = undefined) {
      const path = `Equipments/${equipmentId}/EquipmentRecords`
      const ref = date
        ? query(collection(this.$firestore, path), where('date', '>', date))
        : collection(this.$firestore, path)
      const snapshot = await getDocs(ref)
      return snapshot.docs.reduce(
        (acc, i) => {
          acc[i.type] += i.amount
          return acc
        },
        { receiving: 0, shipping: 0 }
      )
    },
    subscribe() {
      const colRef = collection(this.$firestore, this.model.collection)
      this.listener = onSnapshot(colRef, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          const item = change.doc.data()
          const index = this.items.findIndex(
            ({ docId }) => docId === item.docId
          )
          item.history = await this.getEquipmentRecords(item.docId)
          item.currentAmount =
            (item?.inventoryAmount || 0) +
            item.history.receiving -
            item.history.shipping
          if (change.type === 'added') this.items.push(item)
          if (change.type === 'modified') this.items.splice(index, 1, item)
          if (change.type === 'removed') this.items.splice(index, 1)
        })
      })
    },
    initialize() {
      this.editMode = 'REGIST'
      this.model.initialize()
    },
    onClickEdit(item) {
      this.editMode = 'UPDATE'
      this.model.initialize(item)
      this.dialog = true
    },
    onClickDelete(item) {
      this.editMode = 'DELETE'
      this.model.initialize(item)
      this.dialog = true
    },
    async submit() {
      try {
        this.loading = true
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
    toggledFavorite(item) {
      item.favorite = !item.favorite
    },
  },
}
</script>

<template>
  <div>
    <v-toolbar flat :color="$vuetify.theme.themes.light.background">
      <g-text-field-search v-model="search" />
      <v-dialog v-model="dialog" max-width="360" persistent scrollable>
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon color="primary" v-bind="attrs" v-on="on" />
        </template>
        <g-card-submit-cancel
          :dialog.sync="dialog"
          label="制服・装備品"
          :edit-mode="editMode"
          :loading="loading"
          @click:submit="submit"
        >
          <g-input-equipment v-bind.sync="model" :edit-mode="editMode" />
        </g-card-submit-cancel>
      </v-dialog>
    </v-toolbar>
    <v-container fluid>
      <g-data-table
        :actions="['edit', 'delete']"
        :headers="[
          { text: '名称', value: 'name' },
          {
            text: '棚卸日',
            value: 'inventoryDate',
            align: 'center',
            sortable: false,
          },
          {
            text: '棚卸時在庫数',
            value: 'inventoryAmount',
            align: 'right',
            sortable: false,
          },
          {
            text: '入庫数',
            value: 'history.receiving',
            align: 'right',
            sortable: false,
          },
          {
            text: '出庫数',
            value: 'history.shipping',
            align: 'right',
            sortable: false,
          },
          {
            text: '現在在庫数',
            value: 'currentAmount',
            align: 'right',
            sortable: false,
          },
        ]"
        :items="items"
        :loading="loading"
        :search="search"
        sort-by="name"
        @click:edit="onClickEdit"
        @click:delete="onClickDelete"
      >
      </g-data-table>
    </v-container>
  </div>
</template>

<style></style>
