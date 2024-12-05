<script>
/**
 * ## pages.EmployeeIndex
 *
 * 従業員情報の一覧ページです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-09-06 - 初版作成
 */
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import GDataTableEmployees from '~/components/molecules/tables/GDataTableEmployees.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GInputEmployee from '~/components/molecules/inputs/GInputEmployee.vue'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import Employee from '~/models/Employee'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'EmployeesIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateIndex,
    GDataTableEmployees,
    GSwitch,
    GBtnRegistIcon,
    GInputEmployee,
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
      instance: new Employee(),
      includeExpired: false,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    items() {
      return this.$store.getters['employees/items'].filter(({ status }) => {
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
    onClickRow(item) {
      // 詳細ページが出来上がったらこちらを適用
      this.$router.push(`/employees/${item.docId}`)
    },
  },
}
</script>

<template>
  <g-template-index label="従業員管理" :items="items">
    <template #append-search>
      <g-dialog-input v-model="dialog">
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon color="primary" v-bind="attrs" v-on="on" />
        </template>
        <template #default="{ attrs, on }">
          <g-input-employee
            v-bind="attrs"
            :edit-mode.sync="editMode"
            :instance="instance"
            v-on="on"
          />
        </template>
      </g-dialog-input>
    </template>
    <template #nav>
      <g-switch v-model="includeExpired" hide-details label="退職者を含める" />
    </template>
    <template #default="{ attrs, on, search }">
      <g-data-table-employees
        v-bind="attrs"
        :search="search"
        @click:row="onClickRow"
        v-on="on"
      />
    </template>
  </g-template-index>
</template>

<style></style>
