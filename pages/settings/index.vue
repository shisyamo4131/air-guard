<script>
/**
 * 設定画面です。
 * @author shisyamo4131
 */
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
import GTemplateDetail from '~/components/templates/GTemplateDetail.vue'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import GInputCompanyInfo from '~/components/molecules/inputs/GInputCompanyInfo.vue'
import CompanyInfo from '~/models/CompanyInfo'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'Settings',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDetail,
    GDialogInput,
    GInputCompanyInfo,
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
      /**
       * ダイアログ制御
       */
      dialog: {
        companyInfo: false,
      },

      /**
       * 各種ドキュメントに対するリスナー
       */
      listener: {
        companyInfo: new CompanyInfo(),
      },
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {},

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {},

  /***************************************************************************
   * MOUNTED
   ***************************************************************************/
  mounted() {
    this.listener.companyInfo.subscribe('companyInfo')
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    if (this.listener.companyInfo) this.listener.companyInfo.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 自社情報編集画面を開きます。
     */
    onClickEdit() {
      this.dialog.companyInfo = true
    },
  },
}
</script>

<template>
  <g-template-detail
    :actions="[{ event: 'edit', icon: 'mdi-pencil', color: 'green' }]"
    @click:edit="onClickEdit"
  >
    <!-- 自社情報 -->
    <v-container> </v-container>

    <!-- editor -->
    <g-dialog-input v-model="dialog.companyInfo" :edit-mode="UPDATE">
      <template #default="{ attrs, on }">
        <g-input-company-info
          v-bind="attrs"
          :instance="listener.companyInfo"
          v-on="on"
        />
      </template>
    </g-dialog-input>
  </g-template-detail>
</template>

<style></style>
