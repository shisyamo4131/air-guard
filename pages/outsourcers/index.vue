<script>
/**
 * ## pages.OutsourcersIndex
 *
 * 外注先情報の一覧ページです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-09-06 - 初版作成
 */
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GInputOutsourcer from '~/components/molecules/inputs/GInputOutsourcer.vue'
import GDataTableOutsourcers from '~/components/molecules/tables/GDataTableOutsourcers.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import Outsourcer from '~/models/Outsourcer'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'OutsourcersIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GBtnRegistIcon,
    GInputOutsourcer,
    GDataTableOutsourcers,
    GTemplateIndex,
    GSwitch,
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
      instance: new Outsourcer(),
      includeExpired: false,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    items() {
      return this.$store.getters['outsourcers/items'].filter(({ status }) => {
        return this.includeExpired || status === 'active'
      })
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
      // this.$router.push(`/customers/${item.docId}`)
      await this.instance.fetch(item.docId)
      this.editMode = this.UPDATE
      this.dialog = true
    },
  },
}
</script>

<template>
  <g-template-index label="外注先管理" :items="items">
    <template #append-search>
      <g-dialog-input v-model="dialog" :edit-mode.sync="editMode">
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon color="primary" v-bind="attrs" v-on="on" />
        </template>
        <template #default="{ attrs, on }">
          <g-input-outsourcer v-bind="attrs" :instance="instance" v-on="on" />
        </template>
      </g-dialog-input>
    </template>
    <template #nav>
      <g-switch
        v-model="includeExpired"
        label="取引終了を含める"
        hide-details
      />
    </template>
    <template #default="{ attrs, on, search }">
      <g-data-table-outsourcers
        v-bind="attrs"
        :search="search"
        sort-by="code"
        sort-desc
        @click:row="onClickRow"
        v-on="on"
      />
    </template>
  </g-template-index>
</template>

<style></style>
