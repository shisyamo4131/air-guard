<script>
/**
 * 手当マスタの一覧ページです。
 * @author shisyamo4131
 */
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GInputAllowance from '~/components/molecules/inputs/GInputAllowance.vue'
import GDataTableAllowances from '~/components/molecules/tables/GDataTableAllowances.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import Allowance from '~/models/Allowance'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'AllowancesIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GBtnRegistIcon,
    GInputAllowance,
    GDataTableAllowances,
    GTemplateIndex,
    GDialogInput,
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
      instance: new Allowance(),
      includeExpired: false,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    items() {
      return this.$store.getters['allowances/items']
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      if (!v) {
        this.instance.initialize()
        this.editMode = this.CREATE
      }
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async onClickRow(item) {
      // 詳細ページが出来上がったらこちらを適用
      // this.$router.push(`/allowances/${item.docId}`)
      // this.instance.initialize(item)
      await this.instance.fetch(item.docId)
      this.editMode = this.UPDATE
      this.dialog = true
    },
  },
}
</script>

<template>
  <g-template-index label="手当マスタ管理" :items="items">
    <template #append-search>
      <g-dialog-input
        v-model="dialog"
        :edit-mode.sync="editMode"
        max-width="360"
      >
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon color="primary" v-bind="attrs" v-on="on" />
        </template>
        <template #default="{ attrs, on }">
          <g-input-allowance v-bind="attrs" :instance="instance" v-on="on" />
        </template>
      </g-dialog-input>
    </template>
    <template #default="{ attrs, on, search }">
      <g-data-table-allowances
        v-bind="attrs"
        :search="search"
        :items="items"
        @click:row="onClickRow"
        v-on="on"
      />
    </template>
  </g-template-index>
</template>

<style></style>
