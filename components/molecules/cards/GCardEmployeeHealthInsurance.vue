<script>
import GCardFloatingLabel from '../../atoms/cards/GCardFloatingLabel.vue'
import GInputEmployeeHealthInsurance from '../inputs/GInputEmployeeHealthInsurance.vue'
import GDialogInput from '../dialogs/GDialogInput.vue'
import GBtnEditIcon from '~/components/atoms/btns/GBtnEditIcon.vue'
import EmployeeSocialSecurity from '~/models/EmployeeSocialSecurity'
import ADocumentSubscriber from '~/components/atoms/renderless/ADocumentSubscriber.vue'
import GListIterator from '~/components/atoms/lists/GListIterator.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GBtnEditIcon,
    GCardFloatingLabel,
    ADocumentSubscriber,
    GListIterator,
    GInputEmployeeHealthInsurance,
    GDialogInput,
  },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * 管理対象のドキュメントIDです。
     */
    docId: { type: String, default: '', required: false },

    /**
     * 管理対象のインスタンスです。
     * - FireModel を継承したクラスインスタンスである必要があります。
     */
    instance: {
      type: Object,
      default: () => new EmployeeSocialSecurity(),
      required: false,
      validator: (instance) => instance instanceof EmployeeSocialSecurity,
    },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      item: {
        healthInsuranceType: 'NONE',
        healthInsuranceAcquisitionDate: '2024-01-01',
        healthInsuranceStandardMonthlyAmount: 2000,
        healthInsurancePolicyNumber: '19',
      },

      lists: [
        {
          text: '種類',
          value: 'healthInsuranceType',
          icon: 'mdi-shield',
          transformation: (value) => {
            return this.$HEALTH_INSURANCE_TYPE[value]
          },
        },
        {
          text: '資格取得日',
          value: 'healthInsuranceAcquisitionDate',
          icon: 'mdi-calendar-check',
          transformation: (value) => {
            if (!value) return ''
            return this.$dayjs(value).format('YYYY年MM月DD日')
          },
        },
        {
          text: '標準報酬月額',
          value: 'healthInsuranceStandardMonthlyAmount',
          icon: 'mdi-currency-jpy',
          transformation: (value) => {
            if (!value || isNaN(value)) return ''
            return `${value.toLocaleString()} 円/月`
          },
        },
        {
          text: '被保険者整理番号',
          value: 'healthInsurancePolicyNumber',
          icon: 'mdi-card-account-details',
        },
      ],
    }
  },
}
</script>

<template>
  <a-document-subscriber
    v-slot="{ dialog }"
    doc-id="docId"
    :instance="instance"
  >
    <g-card-floating-label
      color="info"
      label="健康保険"
      icon="mdi-hospital-box"
    >
      <g-list-iterator icon-color="info" :lists="lists" :item="item" />
      <v-card-actions class="pt-0 justify-end">
        <g-dialog-input v-bind="dialog.attrs" max-width="360">
          <template #activator="{ attrs, on }">
            <g-btn-edit-icon v-bind="attrs" color="info" v-on="on" />
          </template>
          <template #default="{ attrs, on }">
            <g-input-employee-health-insurance v-bind="attrs" v-on="on" />
          </template>
        </g-dialog-input>
      </v-card-actions>
    </g-card-floating-label>
  </a-document-subscriber>
</template>

<style></style>
