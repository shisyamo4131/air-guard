<script>
/**
 * 従業員の警備員登録情報を表示・管理するコンポーネントです。
 * - props.docId を指定すると従業員ドキュメントを読み込んで表示します。
 * - props.instance に従業員インスタンスを渡すことでも表示が可能です。
 * - props.docId は props.instance よりも優先されます。
 * - props.docId が指定されている場合のみ編集が可能です。
 *   -> インスタンスが Minimal などであった場合に情報が欠落してしまう為
 * @author shisyamo4131
 */
import ja from 'dayjs/locale/ja'
import GDialogInput from '../dialogs/GDialogInput.vue'
import GInputSecurityRegistration from '../inputs/GInputSecurityRegistration.vue'
import GCardColorIndicator from './GCardColorIndicator.vue'
import GBtnEditIcon from '~/components/atoms/btns/GBtnEditIcon.vue'
import Employee from '~/models/Employee'

export default {
  /****************************************************************************
   * COMPONENTS
   ****************************************************************************/
  components: {
    GDialogInput,
    GBtnEditIcon,
    GInputSecurityRegistration,
    GCardColorIndicator,
  },

  /****************************************************************************
   * PROPS
   ****************************************************************************/
  props: {
    /**
     * 当該警備員登録情報を編集不可能にします。
     */
    disableEdit: { type: Boolean, default: false, required: false },

    /**
     * 従業員ドキュメントID
     * - 指定された ID に該当するドキュメントを Firestore から取得します。
     * - ID が指定された場合 props.instance は無視されます。
     */
    docId: { type: String, default: undefined, required: false },

    /**
     * 従業員インスタンスを受け取ります。
     */
    instance: {
      type: Object,
      default: () => new Employee(),
      validator: (instance) => instance instanceof Employee,
      required: false,
    },
  },

  /****************************************************************************
   * DATA
   ****************************************************************************/
  data() {
    return {
      error: {
        message: null,
        snackbar: false,
      },
      editModel: new Employee(),
      loading: false,
      snackbar: true,
    }
  },

  /****************************************************************************
   * COMPUTED
   ****************************************************************************/
  computed: {
    items() {
      const {
        registrationDate,
        securityStartDate,
        blankMonths,
        honseki,
        emergencyContactName,
        emergencyContactRelation,
        emergencyContactRelationDetail,
        emergencyContactAddress,
        emergencyContactTel,
      } = this.editModel.securityRegistration
      return [
        {
          label: '警備員登録日',
          text: this.error.message
            ? '-'
            : `${this.$dayjs(registrationDate)
                .locale(ja)
                .format('YYYY年MM月DD日（ddd）')}`,
        },
        {
          label: '警備経験開始日',
          text: this.error.message
            ? '-'
            : `${this.$dayjs(securityStartDate)
                .locale(ja)
                .format('YYYY年MM月DD日（ddd）')}`,
        },
        {
          label: 'ブランク',
          text: this.error.message ? '-' : `${blankMonths}ヶ月`,
        },
        {
          label: '本籍地',
          text: this.error.message || !honseki ? '-' : `${honseki}`,
        },
        {
          label: '緊急連絡先氏名',
          text:
            this.error.message || !emergencyContactName
              ? '-'
              : `${emergencyContactName}`,
        },
        {
          label: '緊急連絡先続柄',
          text:
            this.error.message || !emergencyContactRelation
              ? '-'
              : `${emergencyContactRelationDetail} (${this.$RELATION[emergencyContactRelation]})`,
        },
        {
          label: '緊急連絡先住所',
          text:
            this.error.message || !emergencyContactAddress
              ? '-'
              : `${emergencyContactAddress}`,
        },
        {
          label: '緊急連絡先電話番号',
          text:
            this.error.message || !emergencyContactTel
              ? '-'
              : `${emergencyContactTel}`,
        },
      ]
    },
  },

  /****************************************************************************
   * WATCH
   ****************************************************************************/
  watch: {
    /**
     * 指定された従業員 ID のドキュメントの購読を開始します。
     */
    docId: {
      handler(v) {
        if (!v) return
        this.editModel.subscribe(v)
      },
      immediate: true,
    },

    /**
     * props.instance の内容で data.editModel を初期化します。
     * - props.docId が指定されている場合は無視されます。
     */
    instance: {
      handler(v) {
        if (this.docId) return
        this.editModel.initialize(v)
      },
      immediate: true,
    },
  },

  /****************************************************************************
   * METHODS
   ****************************************************************************/
  methods: {
    /**
     * エラー状態を初期化します。
     */
    initError() {
      this.error.message = null
      this.error.snackbar = false
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title class="g-card__title justify-space-between">
      <div>警備員登録情報</div>
      <g-dialog-input edit-mode="UPDATE" max-width="480">
        <template #activator="{ attrs, on }">
          <g-btn-edit-icon
            :disabled="error.message || !docId || disableEdit"
            v-bind="attrs"
            color="primary"
            v-on="on"
          />
        </template>
        <template #default="{ attrs, on }">
          <g-input-security-registration
            v-bind="attrs"
            :instance="editModel"
            v-on="on"
          />
        </template>
      </g-dialog-input>
    </v-card-title>
    <v-card-text v-if="instance.hasSecurityRegistration">
      <v-alert class="mb-0" type="info" text>
        警備員登録はありません。
      </v-alert>
    </v-card-text>
    <v-card-text v-else>
      <div class="d-flex flex-column flex-sm-row flex-wrap" style="gap: 12px">
        <g-card-color-indicator
          v-for="(item, index) of items"
          :key="index"
          style="flex: 1"
          min-width="204"
          outlined
          :color-index="index"
          :item="item"
        >
        </g-card-color-indicator>
      </div>
    </v-card-text>
    <v-snackbar v-model="error.snackbar" centered color="error">
      {{ error.message }}
    </v-snackbar>
  </v-card>
</template>

<style></style>
