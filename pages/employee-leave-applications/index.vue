<script>
/**
 * 従業員休暇申請管理の一覧ページです。
 * @author shisyamo4131
 */
import GInputEmployeeLeaveApplication from '~/components/molecules/inputs/GInputEmployeeLeaveApplication.vue'
import GDataTableEmployeeLeaveApplications from '~/components/molecules/tables/GDataTableEmployeeLeaveApplications.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import EmployeeLeaveApplication from '~/models/EmployeeLeaveApplication'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GTextFieldMonth from '~/components/molecules/inputs/GTextFieldMonth.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'EmployeeLeaveApplicationsIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputEmployeeLeaveApplication,
    GTemplateIndex,
    GDataTableEmployeeLeaveApplications,
    GDialogInput,
    GBtnRegistIcon,
    GTextFieldMonth,
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
      instance: new EmployeeLeaveApplication(),
      items: [],
      month: this.$dayjs().format('YYYY-MM'),
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    filteredItems() {
      return this.items
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
    month: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        const constraints = [['where', 'month', '==', newVal]]
        this.items = this.instance.subscribeDocs(constraints)
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.instance.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickRow(item) {
      // 詳細ページが出来上がったらこちらを適用
      // this.$router.push(`/customers/${item.docId}`)
      this.instance.initialize(item)
      this.editMode = this.UPDATE
      this.dialog = true
    },
  },
}
</script>

<template>
  <g-template-index label="従業員休暇申請管理" :items="filteredItems">
    <template #search="{ attrs }">
      <g-text-field-month v-model="month" :options="attrs" />
      <v-spacer />
    </template>
    <template #append-search>
      <g-dialog-input
        v-model="dialog"
        :edit-mode.sync="editMode"
        :instance="instance"
      >
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon color="primary" v-bind="attrs" v-on="on" />
        </template>
        <template #default="{ attrs, on }">
          <g-input-employee-leave-application v-bind="attrs" tile v-on="on" />
        </template>
      </g-dialog-input>
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-employee-leave-applications
        v-bind="attrs"
        @click:row="onClickRow"
        v-on="on"
      />
    </template>
  </g-template-index>
</template>

<style></style>
