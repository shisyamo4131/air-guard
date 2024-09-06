<script>
/**
 * ## pages.EquipmentsIndex
 *
 * 制服・装備品情報の一覧ページです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-09-06 - 初版作成
 */
import { where } from 'firebase/firestore'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GInputEquipment from '~/components/molecules/inputs/GInputEquipment.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GDataTableEquipments from '~/components/molecules/tables/GDataTableEquipments.vue'
import Equipment from '~/models/Equipment'
import GEditModeMixin from '~/mixins/GEditModeMixin'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'EquipmentsIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GBtnRegistIcon,
    GInputEquipment,
    GTemplateIndex,
    GDialogInput,
    GSwitch,
    GDataTableEquipments,
  },
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GEditModeMixin],
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      instance: new Equipment(),
      includeExpired: false,
      items: {
        active: this.$store.state.equipments.items,
        expired: [],
      },
      listener: new Equipment(),
    }
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      if (!v) {
        this.instance.initialize()
        this.editMode = this.CREATE
      }
    },
    includeExpired: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.subscribeInactiveDocs()
      },
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.listener.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickRow(item) {
      // 詳細ページが出来上がったらこちらを適用
      // this.$router.push(`/customers/${item.docId}`)
      this.instance.initialize(item)
      this.editMode = this.UPDATE
      this.dialog = true
    },
    subscribeExpiredDocs() {
      this.items.expired = this.listener.subscribeDocs([
        where('status', '!=', 'active'),
      ])
    },
  },
}
</script>

<template>
  <g-template-index :items="items.active.concat(items.expired)">
    <template #append-search>
      <g-dialog-input v-model="dialog">
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon color="primary" v-bind="attrs" v-on="on" />
        </template>
        <template #default="{ attrs, on }">
          <g-input-equipment
            v-bind="attrs"
            :edit-mode="editMode"
            :instance="instance"
            v-on="on"
          />
        </template>
      </g-dialog-input>
    </template>
    <template #nav>
      <g-switch
        v-model="includeExpired"
        :disabled="includeExpired"
        label="使用終了を含める"
        hide-details
      />
    </template>
    <template #default="{ attrs, on, search }">
      <g-data-table-equipments
        v-bind="attrs"
        :search="search"
        @click:row="onClickRow"
        v-on="on"
      />
    </template>
  </g-template-index>
</template>

<style></style>
