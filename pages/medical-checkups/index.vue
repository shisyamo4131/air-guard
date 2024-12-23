<script>
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GDataTableMedicalCheckups from '~/components/atoms/tables/GDataTableMedicalCheckups.vue'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
import GAutocompleteEmployee from '~/components/molecules/inputs/GAutocompleteEmployee.vue'
import GInputMedicalCheckup from '~/components/molecules/inputs/GInputMedicalCheckup.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import MedicalCheckup from '~/models/MedicalCheckup'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'MedicalCheckupsIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateIndex,
    GAutocompleteEmployee,
    GDialogInput,
    GBtnRegistIcon,
    GInputMedicalCheckup,
    GDataTableMedicalCheckups,
  },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeProvider],

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      docs: [],
      instance: new MedicalCheckup(),
      selectedEmployeeId: null,
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      if (v) return
      this.editMode = this.CREATE
      this.instance.initialize()
    },

    selectedEmployeeId: {
      handler(v) {
        this.subscribe()
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * DataTable の行がクリックされた時の処理です。
     * - 編集画面を開きます。
     */
    onClickRow(item) {
      this.editMode = this.UPDATE
      this.instance.initialize(item)
      this.dialog = true
    },

    /**
     * 健康診断ドキュメントへの購読を開始します。
     */
    subscribe() {
      this.unsubscribe()
      if (!this.selectedEmployeeId) return
      this.docs = this.instance.subscribeDocs([
        ['where', 'employeeId', '==', this.selectedEmployeeId],
      ])
    },

    /**
     * 健康診断ドキュメントへの購読を解除します。
     */
    unsubscribe() {
      this.docs.splice(0)
      this.instance.unsubscribe()
    },
  },
}
</script>

<template>
  <g-template-index label="健康診断管理" :items="docs">
    <template #search="{ attrs }">
      <g-autocomplete-employee v-bind="attrs" v-model="selectedEmployeeId" />
    </template>
    <template #append-search>
      <g-dialog-input
        v-model="dialog"
        :edit-mode="editMode"
        :instance="instance"
        max-width="600"
      >
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon v-bind="attrs" v-on="on" />
        </template>
        <template #default="{ attrs, on }">
          <g-input-medical-checkup v-bind="attrs" v-on="on" />
        </template>
      </g-dialog-input>
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-medical-checkups
        v-bind="attrs"
        @click:row="onClickRow"
        v-on="on"
      >
      </g-data-table-medical-checkups>
    </template>
  </g-template-index>
</template>

<style></style>
