<script>
import { where } from 'firebase/firestore'
import { get, ref } from 'firebase/database'
import GBtnRegistIcon from '~/components/molecules/btns/GBtnRegistIcon.vue'
import GInputLeaveApplication from '~/components/molecules/inputs/GInputLeaveApplication.vue'
import GDatePicker from '~/components/atoms/pickers/GDatePicker.vue'
import GCardSubmitCancel from '~/components/molecules/cards/GCardSubmitCancel.vue'
import GDialogMonthPicker from '~/components/molecules/dialogs/GDialogMonthPicker.vue'
import GDataTableLeaveApplications from '~/components/molecules/tables/GDataTableLeaveApplications.vue'
import GAutocompleteEmployee from '~/components/atoms/inputs/GAutocompleteEmployee.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
/**
 * ### pages.leave-applications-index
 * @shisyamo4131
 * 将来的には従業員からの申請を承認していくフローに切り替える必要あり。
 * 2024/06/01時点では従業員からの申請はないので、いきなり承認済みのデータを
 * 作成していく。
 */
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'LeaveApplicationsIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GBtnRegistIcon,
    GInputLeaveApplication,
    GDatePicker,
    GCardSubmitCancel,
    GDialogMonthPicker,
    GDataTableLeaveApplications,
    GAutocompleteEmployee,
    GTextField,
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: {
        editor: false,
        datePicker: false,
        monthPicker: false,
      },
      dates: [],
      editMode: 'REGIST',
      items: [],
      listener: null,
      loading: false,
      model: this.$LeaveApplication(),
      pickerDate: undefined,
      search: {
        employeeId: null,
        month: this.$dayjs().format('YYYY-MM'),
        status: 'approved',
      },
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    filteredItems() {
      return this.items.filter((item) => {
        return (
          !this.search.employeeId || item.employeeId === this.search.employeeId
        )
      })
    },
    mode() {
      if (this.editMode === 'REGIST') return '登録'
      if (this.editMode === 'UPDATE') return '変更'
      return '削除'
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    'dialog.editor': {
      handler(v) {
        v || this.initialize()
      },
      immediate: true,
    },
    '$route.query.employeeId': {
      handler(v) {
        this.search.employeeId = v || null
      },
      immediate: true,
    },
    search: {
      handler(v) {
        this.subscribe()
      },
      immediate: true,
      deep: true,
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    if (this.listener) this.listener()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async getEmployee(employeeId) {
      const dbRef = ref(this.$database, `Employees/${employeeId}`)
      const snapshot = await get(dbRef)
      if (!snapshot.exists())
        throw new Error('Could not find employee document. id is ', employeeId)
      return snapshot.val()
    },
    subscribe() {
      this.items = this.model.subscribe(
        undefined,
        [
          where('status', '==', this.search.status),
          where('months', 'array-contains', this.search.month),
        ],
        async (item) => {
          item.employee = await this.getEmployee(item.employeeId)
          return item
        }
      )
    },
    initialize() {
      this.editMode = 'REGIST'
      /* ステータスは常に「承認済み」にし、決済日も入れておく */
      // this.model.initialize({ requestDate: this.$dayjs().format('YYYY-MM-DD') })
      this.model.initialize({
        requestDate: this.$dayjs().format('YYYY-MM-DD'),
        status: 'approved',
        settlementDate: this.$dayjs().format('YYYY-MM-DD'),
      })
    },
    async submit() {
      try {
        this.loading = true
        if (this.editMode === 'REGIST') await this.model.create()
        if (this.editMode === 'UPDATE') await this.model.update()
        if (this.editMode === 'DELETE') await this.model.delete()
        this.dialog.editor = false
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
    onClickEdit(item) {
      this.model.initialize(item)
      this.editMode = 'UPDATE'
      this.dialog.editor = true
    },
    onClickDelete(item) {
      this.model.initialize(item)
      this.editMode = 'DELETE'
      this.dialog.editor = true
    },
    onClickShowDates(item) {
      this.dates = item.dates
      this.pickerDate = item.dates[0]
      this.dialog.datePicker = true
    },
    async onClickApprove(item) {
      this.model.initialize(item)
      this.model.status = 'approved'
      this.model.settlementDate = this.$dayjs().format('YYYY-MM-DD')
      await this.model.update()
    },
    onClickReject(item) {
      this.editMode = 'UPDATE'
      this.model.initialize(item)
      this.model.status = 'rejected'
      this.model.settlementDate = this.$dayjs().format('YYYY-MM-DD')
      this.dialog.editor = true
    },
    onClickWithdraw(item) {
      this.editMode = 'UPDATE'
      this.model.initialize(item)
      this.model.status = 'withdraw'
      this.model.settlementDate = this.$dayjs().format('YYYY-MM-DD')
      this.dialog.editor = true
    },
  },
}
</script>

<template>
  <div>
    <v-container fluid>
      <div class="d-flex mb-4" style="gap: 8px 8px">
        <g-dialog-month-picker v-model="search.month">
          <template #activator="{ attrs, on }">
            <g-text-field
              class="center-input"
              style="min-width: 96px; max-width: 96px"
              v-bind="attrs"
              label="年月"
              hide-details
              v-on="on"
            />
          </template>
        </g-dialog-month-picker>
        <!-- 2024-06-01 外部からの申請がないため、休暇申請は登録時に状態：承認で固定 -->
        <!-- <g-select
          v-model="search.status"
          style="min-width: 108px; max-width: 108px"
          label="状態"
          :items="$LEAVE_APPLICATION_STATUS_ARRAY"
          disabled
          hide-details
        /> -->
        <g-autocomplete-employee
          v-model="search.employeeId"
          style="min-width: 168px; max-width: 168px"
          clearable
          hide-details
          label="従業員"
        />
        <v-dialog v-model="dialog.editor" max-width="600" persistent scrollable>
          <template #activator="{ attrs, on }">
            <g-btn-regist-icon
              v-bind="attrs"
              class="ml-auto"
              color="primary"
              v-on="on"
            />
          </template>
          <g-card-submit-cancel
            :dialog.sync="dialog.editor"
            label="休暇申請"
            :edit-mode="editMode"
            :disabled="editMode === 'DELETE'"
            :loading="loading"
            @click:submit="submit"
          >
            <g-input-leave-application
              v-bind.sync="model"
              :edit-mode="editMode"
            />
          </g-card-submit-cancel>
        </v-dialog>
      </div>
      <g-data-table-leave-applications
        :items="items"
        @click:edit="onClickEdit"
        @click:delete="onClickDelete"
        @click:show-dates="onClickShowDates"
      />
      <v-dialog v-model="dialog.datePicker" width="290">
        <g-date-picker
          :value="dates"
          color="primary"
          :allowed-dates="(v) => dates.includes(v)"
          :min="dates.length ? dates[0] : undefined"
          :max="dates.length ? dates[dates.length - 1] : undefined"
          multiple
          no-title
          :picker-date.sync="pickerDate"
        />
      </v-dialog>
    </v-container>
  </div>
</template>

<style></style>
