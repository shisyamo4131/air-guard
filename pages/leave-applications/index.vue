<script>
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import GIconClose from '~/components/atoms/icons/GIconClose.vue'
import GIconSubmit from '~/components/atoms/icons/GIconSubmit.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import GBtnRegistIcon from '~/components/molecules/btns/GBtnRegistIcon.vue'
import GInputLeaveApplication from '~/components/molecules/inputs/GInputLeaveApplication.vue'
import GDatePicker from '~/components/atoms/pickers/GDatePicker.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'LeaveApplicationsIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTable,
    GBtnRegistIcon,
    GInputLeaveApplication,
    GIconClose,
    GIconSubmit,
    GDatePicker,
    GSelect,
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
      form: null,
      items: [],
      listener: null,
      loading: false,
      model: this.$LeaveApplication(),
      pickerDate: undefined,
      scrollTarget: null,
      search: {
        month: this.$dayjs().format('YYYY-MM'),
        status: 'unapproved',
      },
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
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
    search: {
      handler(v) {
        this.subscribe()
      },
      immediate: true,
      deep: true,
    },
  },
  /***************************************************************************
   * MOUNTED
   ***************************************************************************/
  mounted() {
    // this.subscribe()
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
      const model = this.$Employee()
      return await model.fetchDoc(employeeId)
    },
    subscribe() {
      this.items.splice(0)
      const colRef = collection(this.$firestore, 'LeaveApplications')
      const q = query(
        colRef,
        where('status', '==', this.search.status),
        where('months', 'array-contains', this.search.month)
      )
      this.listener = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          const item = change.doc.data()
          const index = this.items.findIndex(
            ({ docId }) => docId === item.docId
          )
          item.employee = await this.getEmployee(item.employeeId)
          if (change.type === 'added') this.items.push(item)
          if (change.type === 'modified') this.items.splice(index, 1, item)
          if (change.type === 'removed') this.items.splice(index, 1)
        })
      })
    },
    initialize() {
      this.editMode = 'REGIST'
      this.model.initialize({ requestDate: this.$dayjs().format('YYYY-MM-DD') })
      this.form?.resetValidation()
      this.scrollTarget?.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    },
    async submit() {
      if (!this.validate()) return
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
    validate() {
      const result = this.form.validate()
      if (!result) alert('入力に不備があります。')
      return result
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
    showDates(item) {
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
    <v-toolbar :color="$vuetify.theme.themes.light.background" flat>
      <g-select
        v-model="search.status"
        label="状態"
        :items="$LEAVE_APPLICATION_STATUS_ARRAY"
        hide-details
      />
      <v-dialog ref="month" v-model="dialog.monthPicker" width="290">
        <template #activator="{ attrs, on }">
          <g-text-field
            v-model="search.month"
            label="対象年月"
            hide-details
            v-bind="attrs"
            readonly
            v-on="on"
          />
        </template>
        <g-date-picker v-model="search.month" type="month" />
      </v-dialog>
      <v-dialog v-model="dialog.editor" max-width="600" persistent scrollable>
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon v-bind="attrs" color="primary" v-on="on" />
        </template>
        <v-card>
          <v-toolbar dense flat color="primary" dark>
            <v-toolbar-title>
              {{ `休暇申請[${mode}]` }}
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text :ref="(el) => (scrollTarget = el)" class="pa-4">
            <v-form
              :ref="(el) => (form = el)"
              :disabled="loading || editMode === 'DELETE'"
            >
              <g-input-leave-application
                v-bind.sync="model"
                :edit-mode="editMode"
              />
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-space-between">
            <v-btn :disabled="loading" @click="dialog.editor = false"
              ><g-icon-close />close</v-btn
            >
            <v-btn
              :disabled="loading"
              :loading="loading"
              color="primary"
              @click="submit"
              ><g-icon-submit />submit</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>
    <v-container fluid>
      <g-data-table
        :headers="[
          { text: '申請日', value: 'requestDate', width: 120 },
          { text: '申請者', value: 'employee.abbr' },
          {
            text: '対象日',
            value: 'dates',
            align: 'center',
            sortable: false,
          },
          {
            text: '状態',
            value: 'status',
            sortable: false,
            align: 'center',
          },
          {
            text: '決済日',
            value: 'settlementDate',
            align: 'center',
            sortable: false,
          },
          {
            text: '',
            value: 'settlementActions',
            align: 'right',
            sortable: false,
          },
        ]"
        :items="items"
        @click:edit="onClickEdit"
        @click:delete="onClickDelete"
      >
        <template #[`item.dates`]="{ item }">
          <div v-if="item.dates.length === 1">
            {{ item.dates[0] }}
          </div>
          <v-btn v-else depressed small @click="showDates(item)">確認</v-btn>
        </template>
        <template #[`item.status`]="{ item }">
          <v-chip small>{{ $LEAVE_APPLICATION_STATUS[item.status] }}</v-chip>
        </template>
        <template #[`item.settlementActions`]="{ item }">
          <v-btn
            :disabled="item.status !== 'unapproved'"
            depressed
            small
            @click="onClickEdit(item)"
            >変更</v-btn
          >
          <v-btn
            :disabled="item.status !== 'unapproved'"
            depressed
            small
            @click="onClickDelete(item)"
            >削除</v-btn
          >
          <v-btn
            :disabled="item.status !== 'unapproved'"
            depressed
            small
            @click="onClickApprove(item)"
            >承認</v-btn
          >
          <v-btn
            :disabled="item.status !== 'unapproved'"
            depressed
            small
            @click="onClickReject(item)"
            >却下</v-btn
          >
          <v-btn
            :disabled="item.status !== 'approved'"
            depressed
            small
            @click="onClickWithdraw(item)"
            >取下</v-btn
          >
        </template>
      </g-data-table>
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
