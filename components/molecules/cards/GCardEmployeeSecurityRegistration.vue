<script>
import GCardFloatingLabel from '../../atoms/cards/GCardFloatingLabel.vue'
import GDialogInput from '../dialogs/GDialogInput.vue'
import GInputSecurityRegistration from '../inputs/GInputSecurityRegistration.vue'
import GBtnEdit from '~/components/atoms/btns/GBtnEdit.vue'
import Employee from '~/models/Employee'
import ADocumentSubscriber from '~/components/atoms/renderless/ADocumentSubscriber.vue'
import GListIterator from '~/components/atoms/lists/GListIterator.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GBtnEdit,
    GCardFloatingLabel,
    ADocumentSubscriber,
    GListIterator,
    GDialogInput,
    GInputSecurityRegistration,
  },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * コンポーネントのカラーです。
     */
    color: { type: String, default: undefined, required: false },

    /**
     * 管理対象のドキュメントIDです。
     */
    docId: { type: String, default: '', required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      instance: new Employee(),
      lists: [
        {
          icon: 'mdi-calendar-check',
          text: '警備員登録日',
          value: 'registrationDate',
          transformation: (value) => {
            if (!value) return 'N/A'
            return this.$dayjs(value).format('YYYY年MM月DD日')
          },
        },
        {
          icon: 'mdi-calendar-arrow-right',
          text: '警備経験開始日',
          value: 'securityStartDate',
          transformation: (value) => {
            if (!value) return 'N/A'
            return this.$dayjs(value).format('YYYY年MM月DD日')
          },
        },
        {
          icon: 'mdi-timer-sand',
          text: 'ブランク',
          value: 'blankMonths',
          transformation: (value) => {
            return `${value}ヶ月`
          },
        },
        {
          icon: 'mdi-home-map-marker',
          text: '本籍地',
          value: 'honseki',
        },
        {
          icon: 'mdi-account-alert',
          text: '緊急連絡先氏名',
          value: 'emergencyContactName',
          transformation: (value, item) => {
            return `${value} (${item.emergencyContactRelationDetail})`
          },
        },
        {
          icon: 'mdi-map-marker-alert',
          text: '緊急連絡先住所',
          value: 'emergencyContactAddress',
        },
        {
          icon: 'mdi-phone-alert',
          text: '緊急連絡先電話番号',
          value: 'emergencyContactTel',
        },
      ],
    }
  },
}
</script>

<template>
  <a-document-subscriber
    v-slot="{ doc, dialog }"
    :doc-id="docId"
    :instance="instance"
  >
    <g-card-floating-label
      :color="color"
      label="警備員登録情報"
      icon="mdi-shield"
    >
      <g-list-iterator
        icon-:color="color"
        :lists="lists"
        :item="doc.securityRegistration"
      />
      <template #actions>
        <g-dialog-input v-bind="dialog.attrs" max-width="480">
          <template #activator="{ attrs, on }">
            <g-btn-edit icon v-bind="attrs" :color="color" v-on="on" />
          </template>
          <template #default="{ attrs, on }">
            <g-input-security-registration v-bind="attrs" v-on="on" />
          </template>
        </g-dialog-input>
      </template>
    </g-card-floating-label>
  </a-document-subscriber>
</template>

<style></style>
