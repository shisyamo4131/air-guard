<script>
import GDataTable from '../../atoms/tables/GDataTable.vue'
import GDialogEditor from '../dialogs/GDialogEditor.vue'
import GInputEmployeeMedicalCheckup from '../inputs/GInputEmployeeMedicalCheckup.vue'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
/**
 * ## GDataTableEmployeeMedicalCheckups
 *
 * 概要:
 * 従業員の健康診断結果表示用DataTableコンポーネントです。
 *
 * @author shisyamo4131
 * @create 2024-07-03
 * @version 1.0.0
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTable,
    GBtnRegistIcon,
    GDialogEditor,
    GInputEmployeeMedicalCheckup,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    docId: { type: String, required: true },
    sortBy: { type: [String, Array], default: 'date', required: false },
    sortDesc: { type: [Boolean, Array], default: true, required: false },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      if (this.$vuetify.breakpoint.smAndDown) {
        return [
          { text: '受診日', value: 'date', width: 120 },
          { text: '血圧', value: 'bloodPressure', sortable: false },
        ]
      }
      return [
        { text: '受診日', value: 'date', width: 120 },
        { text: '受診機関', value: 'agency', sortable: false },
        { text: '血圧', value: 'bloodPressure', sortable: false },
      ]
    },
  },
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
          label="健康診断結果"
          max-width="480"
          model-id="EmployeeMedicalCheckup"
        >
          <template #activator="{ attrs, on }">
            <g-btn-regist-icon v-bind="attrs" color="primary" v-on="on" />
          </template>
          <template #default="{ attrs, on }">
            <g-input-employee-medical-checkup v-bind="attrs" v-on="on" />
          </template>
        </g-dialog-editor>
      </v-toolbar>
    </template>
    <template #[`item.bloodPressure`]="{ item }">
      {{ `${item.bloodPressure.top} - ${item.bloodPressure.bottom}` }}
    </template>
  </g-data-table>
</template>

<style></style>
