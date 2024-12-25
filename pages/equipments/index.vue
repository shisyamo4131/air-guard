<script>
/**
 * 制服・装備品情報の一覧ページです。
 * @author shisyamo4131
 */
import GInputEquipment from '~/components/molecules/inputs/GInputEquipment.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GDataTableEquipments from '~/components/molecules/tables/GDataTableEquipments.vue'
import Equipment from '~/models/Equipment'
import GTemplateDocumentsIndex from '~/components/templates/GTemplateDocumentsIndex.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'EquipmentsIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputEquipment,
    GSwitch,
    GDataTableEquipments,
    GTemplateDocumentsIndex,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      instance: new Equipment(),
      includeExpired: false,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    items() {
      return this.$store.getters['equipments/items'].filter(({ status }) => {
        return this.includeExpired || status === 'active'
      })
    },
  },
}
</script>

<template>
  <g-template-documents-index
    label="制服・装備品管理"
    :items="items"
    :instance="instance"
  >
    <template #input="{ attrs, on }">
      <g-input-equipment v-bind="attrs" v-on="on" />
    </template>
    <template #nav>
      <g-switch
        v-model="includeExpired"
        label="使用終了を含める"
        hide-details
      />
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-equipments v-bind="attrs" v-on="on" />
    </template>
  </g-template-documents-index>
</template>

<style></style>
