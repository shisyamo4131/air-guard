<script>
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GDataTablePensions from '~/components/atoms/tables/GDataTablePensions.vue'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
import GAutocompleteEmployee from '~/components/molecules/inputs/GAutocompleteEmployee.vue'
import GInputPension from '~/components/molecules/inputs/GInputPension.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import Pension from '~/models/Pension'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'PensionsIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateIndex,
    GAutocompleteEmployee,
    GDialogInput,
    GBtnRegistIcon,
    GInputPension,
    GDataTablePensions,
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
      instance: new Pension(),
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

    selectedEmployeeId(v) {
      this.subscribe()
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
     * 厚生年金ドキュメントへの購読を開始します。
     */
    subscribe() {
      this.unsubscribe()
      this.docs = this.instance.subscribeDocs([
        ['where', 'isLossed', '==', false],
      ])
    },

    /**
     * 厚生年金ドキュメントへの購読を解除します。
     */
    unsubscribe() {
      this.docs.splice(0)
      this.instance.unsubscribe()
    },
  },
}
</script>

<template>
  <g-template-index label="厚生年金管理" :items="docs">
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
          <g-input-pension v-bind="attrs" v-on="on" />
        </template>
      </g-dialog-input>
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-pensions v-bind="attrs" @click:row="onClickRow" v-on="on">
      </g-data-table-pensions>
    </template>
  </g-template-index>
</template>

<style></style>
