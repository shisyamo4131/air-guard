<script>
import GCardFloatingLabel from '../../atoms/cards/GCardFloatingLabel.vue'
import GDialogInput from '../dialogs/GDialogInput.vue'
import GDataTableEmployeeContracts from '../tables/GDataTableEmployeeContracts.vue'
import GInputEmployeeContract from '../inputs/GInputEmployeeContract.vue'
import EmployeeContract from '~/models/EmployeeContract'
import ADocumentsSubscriber from '~/components/atoms/renderless/ADocumentsSubscriber.vue'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GCardFloatingLabel,
    GDialogInput,
    ADocumentsSubscriber,
    GDataTableEmployeeContracts,
    GBtnRegistIcon,
    GInputEmployeeContract,
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
      instance: new EmployeeContract(),
    }
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    printLaborTerms(item) {
      this.$GENERATE_LABOR_TERMS(item.docId, { download: false })
    },
  },
}
</script>

<template>
  <a-documents-subscriber
    v-slot="{ dialog, table, openEditor }"
    :instance="instance"
    :condition="[
      ['where', 'employeeId', '==', employeeId],
      ['orderBy', 'startDate', 'desc'],
      ['limit', 3],
    ]"
    edit-event="click:edit"
  >
    <g-card-floating-label
      v-bind="$attrs"
      color="yellow darken-4"
      label="雇用契約（直近3件）"
      icon="mdi-file-sign"
      height="100%"
    >
      <g-data-table-employee-contracts
        v-bind="table.attrs"
        :actions="['edit', 'print']"
        v-on="table.on"
      >
        <template #print="{ item }">
          <v-btn icon @click="printLaborTerms(item)"
            ><v-icon>mdi-printer</v-icon></v-btn
          >
        </template>
      </g-data-table-employee-contracts>
      <template #actions>
        <g-dialog-input v-bind="dialog.attrs" max-width="600">
          <template #activator="{ attrs, on }">
            <g-btn-regist-icon
              v-bind="attrs"
              color="yellow darken-4"
              @click="openEditor()"
              v-on="on"
            />
          </template>
          <template #default="{ attrs, on }">
            <g-input-employee-contract v-bind="attrs" v-on="on" />
          </template>
        </g-dialog-input>
      </template>
    </g-card-floating-label>
  </a-documents-subscriber>
</template>

<style></style>
