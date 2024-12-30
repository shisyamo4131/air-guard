<script>
/**
 * 自社情報を表示・管理するコンポーネントです。
 * - データはすべて Vuex から取得されます。
 * @author shisyamo4131
 */
import GDialogInput from '../dialogs/GDialogInput.vue'
import GInputCompanyInfo from '../inputs/GInputCompanyInfo.vue'
import GCardColorIndicator from './GCardColorIndicator.vue'
import GBtnEdit from '~/components/atoms/btns/GBtnEdit.vue'
import CompanyInfo from '~/models/CompanyInfo'

export default {
  /****************************************************************************
   * COMPONENTS
   ****************************************************************************/
  components: {
    GDialogInput,
    GBtnEdit,
    GCardColorIndicator,
    GInputCompanyInfo,
  },

  /****************************************************************************
   * PROPS
   ****************************************************************************/
  props: {
    /**
     * 自社情報を編集不可能にします。
     */
    disableEdit: { type: Boolean, default: false, required: false },
  },

  /****************************************************************************
   * DATA
   ****************************************************************************/
  data() {
    return {
      dialog: false,
      error: {
        message: null,
        snackbar: false,
      },
      editModel: new CompanyInfo(),
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
        name1,
        name2,
        zipcode,
        address1,
        address2,
        tel,
        fax,
        corporateNumber,
        executiveName,
        executiveTitle,
      } = this.$store.state['company-info'].item
      return [
        {
          label: '会社名',
          value: 'name1',
          text: this.error.message ? '-' : `${name1}\n${name2}`,
        },
        {
          label: '所在地',
          value: 'name1',
          text: this.error.message
            ? '-'
            : `〒${zipcode}\n${address1} ${address2}`,
        },
        {
          label: '電話・FAX',
          value: 'name1',
          text: this.error.message ? '-' : `${tel}\n${fax}`,
        },
        {
          label: '法人番号',
          value: 'name1',
          text: this.error.message ? '-' : `${corporateNumber}`,
        },
        {
          label: '代表者',
          value: 'name1',
          text: this.error.message ? '-' : `${executiveTitle} ${executiveName}`,
        },
      ]
    },
  },

  /****************************************************************************
   * WATCH
   ****************************************************************************/
  watch: {
    dialog(v) {
      if (!v) return
      this.editModel.initialize(this.$store.state['company-info'].item)
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
      <div>自社情報</div>
      <g-dialog-input
        v-model="dialog"
        edit-mode="UPDATE"
        :instance="editModel"
        max-width="480"
      >
        <template #activator="{ attrs, on }">
          <g-btn-edit
            icon
            :disabled="error.message || disableEdit"
            v-bind="attrs"
            color="primary"
            v-on="on"
          />
        </template>
        <template #default="{ attrs, on }">
          <g-input-company-info v-bind="attrs" v-on="on" />
        </template>
      </g-dialog-input>
    </v-card-title>
    <v-card-text>
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
