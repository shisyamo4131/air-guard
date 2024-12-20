<script>
import GCardFloatingLabel from '../../atoms/cards/GCardFloatingLabel.vue'
import GDialogInput from '../dialogs/GDialogInput.vue'
import GInputEmployeePension from '../inputs/GInputEmployeePension.vue'
import EmployeePension from '~/models/EmployeePension'
import ADocumentsSubscriber from '~/components/atoms/renderless/ADocumentsSubscriber.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GCardFloatingLabel,
    GDialogInput,
    GInputEmployeePension,
    ADocumentsSubscriber,
    GDataTable,
    GBtnRegistIcon,
  },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * 管理対象の従業員IDです。
     */
    employeeId: { type: String, required: true },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      instance: new EmployeePension(),
      headers: [
        {
          text: '資格取得日',
          value: 'acquisitionDate',
        },
        {
          text: '標準報酬月額',
          value: 'standardMonthlyAmount',
        },
        {
          text: '被保険者整理番号',
          value: 'policyNumber',
        },
      ],
    }
  },
}
</script>

<template>
  <a-documents-subscriber
    v-slot="{ dialog, table, openEditor }"
    :default-item="{ employeeId }"
    :instance="instance"
    :condition="[
      ['where', 'employeeId', '==', employeeId],
      ['orderBy', 'acquisitionDate', 'desc'],
      ['limit', 3],
    ]"
  >
    <g-card-floating-label
      v-bind="$attrs"
      color="yellow darken-4"
      label="厚生年金"
      icon="mdi-scale-balance"
    >
      <g-data-table
        v-bind="table.attrs"
        :headers="headers"
        button-color="yellow darken-4"
        v-on="table.on"
      >
      </g-data-table>
      <template #actions>
        <g-dialog-input v-bind="dialog.attrs" max-width="360">
          <template #activator="{ attrs, on }">
            <g-btn-regist-icon
              v-bind="attrs"
              color="yellow darken-4"
              @click="openEditor()"
              v-on="on"
            />
          </template>
          <template #default="{ attrs, on }">
            <g-input-employee-pension v-bind="attrs" v-on="on" />
          </template>
        </g-dialog-input>
      </template>
    </g-card-floating-label>
  </a-documents-subscriber>
</template>

<style></style>
