<script>
/**
 * ## GDataTableEmployeeContracts
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-18 - 初版作成
 */
import GDataTable from '../../atoms/tables/GDataTable.vue'
import GDialogEditor from '../dialogs/GDialogEditor.vue'
import GInputEmployeeContract from '../inputs/GInputEmployeeContract.vue'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTable,
    GDialogEditor,
    GInputEmployeeContract,
    GBtnRegistIcon,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    docId: { type: String, required: true },
    sortBy: { type: [String, Array], default: 'startDate', required: false },
    sortDesc: { type: [Boolean, Array], default: true, required: false },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      if (this.$vuetify.breakpoint.xs) {
        return [{ text: '契約日', value: 'startDate' }]
      }
      return [
        { text: '契約日', value: 'startDate' },
        { text: '雇用形態', value: 'contractType' },
      ]
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickEdit(item) {
      this.$refs.editor.open({ item, editMode: 'UPDATE' })
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="{ ...$props, ...$attrs }"
    :actions="['edit']"
    :headers="headers"
    :mobile-breakpoint="0"
    @click:edit="onClickEdit"
    v-on="$listeners"
  >
    <template #top>
      <v-toolbar dense>
        <v-spacer />
        <g-dialog-editor
          ref="editor"
          :default-item="{ employeeId: docId }"
          label="雇用契約"
          max-width="480"
          model-id="EmployeeContract"
        >
          <template #activator="{ attrs, on }">
            <g-btn-regist-icon v-bind="attrs" color="primary" v-on="on" />
          </template>
          <template #default="{ attrs, on }">
            <g-input-employee-contract v-bind="attrs" v-on="on" />
          </template>
        </g-dialog-editor>
      </v-toolbar>
    </template>
  </g-data-table>
</template>

<style></style>
