<template>
  <g-template-default label="休暇申請管理">
    <template #append-toolbar>
      <v-spacer />
      <v-toolbar-items>
        <v-dialog v-model="dialog.create" max-width="600" scrollable>
          <template #activator="{ attrs, on }">
            <v-btn v-bind="attrs" text v-on="on">
              <v-icon>mdi-plus</v-icon>
              <span>登録</span>
            </v-btn>
          </template>
          <g-leave-application-register
            ref="form-create"
            :employees="employees"
            @click:cancel="dialog.create = false"
            @submitted="dialog.create = false"
          />
        </v-dialog>

        <v-dialog v-model="dialog.modify" max-width="600" scrollable>
          <g-card-input-form
            ref="form-modify"
            label="休暇申請"
            :loading="loading"
            :edit-mode="editMode"
            @click:cancel="dialog.modify = false"
            @click:submit="submit"
          >
            <template #default>
              <g-input-application
                v-bind.sync="editItem"
                :edit-mode="editMode"
                :employees="employees"
              />
            </template>
          </g-card-input-form>
        </v-dialog>
      </v-toolbar-items>
    </template>
    <template #default>
      <v-container fluid>
        <v-toolbar flat>
          <v-row>
            <v-col>
              <a-select
                v-model="search.status"
                label="状態"
                :items="$LEAVE_APPLICATION_STATUS_ARRAY"
              />
            </v-col>
            <v-col>
              <a-select
                v-model="search.type"
                label="申請区分"
                :items="$LEAVE_APPLICATION_TYPE_ARRAY"
              />
            </v-col>
          </v-row>
        </v-toolbar>
        <g-data-table
          :headers="headers"
          :items="items"
          show-actions
          @click:edit="openEditor($event, 'UPDATE')"
          @click:delete="openEditor($event, 'DELETE')"
        >
          <template #[`item.type`]="{ item }">
            {{ $LEAVE_APPLICATION_TYPE[item.type] }}
          </template>
          <template #[`item.employeeId`]="{ item }">
            {{ $store.getters['masters/Employee'](item.employeeId).abbr }}
          </template>
          <template #[`item.status`]="{ item }">
            {{ $LEAVE_APPLICATION_STATUS[item.status] }}
          </template>
        </g-data-table>
      </v-container>
      <!-- dialog to approve or reject application. -->
      <v-dialog v-model="dialog.approve" max-width="600">
        <g-card-input-form
          ref="form-approve"
          label="申請承認"
          :edit-mode="editMode"
          :loading="loading"
          @click:cancel="dialog.approve = false"
          @click:submit="submitAs(reject ? 'reject' : 'approved')"
        >
          <template #default>
            <g-input-application-approve
              v-bind.sync="editItem"
              :reject.sync="reject"
            />
          </template>
          <template #btn-submit="{ attrs, on }">
            <v-btn
              v-bind="attrs"
              :color="reject ? 'warning' : 'primary'"
              v-on="on"
            >
              {{ reject ? '却下' : '承認' }}
            </v-btn>
          </template>
        </g-card-input-form>
      </v-dialog>
      <v-dialog v-model="dialog.unapprove" max-width="360">
        <v-card>
          <v-card-title>承認取り消し</v-card-title>
          <v-card-text> 一度承認した申請を取り消しますか？ </v-card-text>
          <v-card-actions class="justify-space-between">
            <v-btn @click="dialog.unapprove = false">cancel</v-btn>
            <v-btn @click="submitAs('unapproved')">submit</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </g-template-default>
</template>

<script>
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import ASelect from '~/components/atoms/inputs/ASelect.vue'
import GCardInputForm from '~/components/molecules/cards/GCardInputForm.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GInputApplicationApprove from '~/components/molecules/inputs/GInputApplicationApprove.vue'
import GDataTable from '~/components/molecules/tables/GDataTable.vue'
import GLeaveApplicationRegister from '~/components/organisms/GLeaveApplicationRegister.vue'
import GInputApplication from '~/components/molecules/inputs/GInputApplication.vue'
export default {
  components: {
    GTemplateDefault,
    GCardInputForm,
    ASelect,
    GInputApplicationApprove,
    GDataTable,
    GLeaveApplicationRegister,
    GInputApplication,
  },
  data() {
    return {
      dialog: {
        create: false,
        modify: false,
        approve: false,
        unapprove: false,
      },
      headers: [
        { text: '申請日', value: 'requestDate' },
        { text: '申請区分', value: 'type' },
        { text: '申請者', value: 'employeeId' },
        { text: '対象日', value: 'date' },
        { text: '状態', value: 'status' },
      ],
      editItem: this.$LeaveApplication(),
      editMode: 'REGIST',
      items: [],
      listener: null,
      loading: false,
      search: {
        type: 'non-paid',
        status: 'unapproved',
      },
      reject: false,
    }
  },
  computed: {
    employees() {
      return this.$store.getters['masters/Employees']
    },
  },
  watch: {
    'dialog.create'(v) {
      if (v) return
      this.$refs['form-create'].initialize()
      this.$nextTick(() => {
        this.editItem.initialize()
        this.editMode = 'REGIST'
      })
    },
    'dialog.modify'(v) {
      if (v) return
      this.$refs['form-modify'].initialize()
      this.$nextTick(() => {
        this.editItem.initialize()
        this.editMode = 'REGIST'
      })
    },
    'dialog.approve'(v) {
      if (v) return
      this.$refs['form-approve'].initialize()
      this.$nextTick(() => {
        this.editItem.initialize()
        this.editMode = 'REGIST'
      })
    },
    'search.type': {
      handler(v) {
        this.subscribe()
      },
      immediate: true,
    },
    'search.status': {
      handler(v) {
        this.subscribe()
      },
      immediate: true,
    },
  },
  destroyed() {
    this.unsubscribe()
  },
  methods: {
    subscribe() {
      this.unsubscribe()
      const colRef = collection(this.$firestore, 'LeaveApplications')
      const q = query(
        colRef,
        where('type', '==', this.search.type),
        where('status', '==', this.search.status)
      )
      this.listener = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const item = change.doc.data()
          const index = this.items.findIndex(
            ({ docId }) => docId === item.docId
          )
          if (change.type === 'added') this.items.push(item)
          if (change.type === 'modified') this.items.splice(index, 1, item)
          if (change.type === 'removed') this.items.splice(index, 1)
        })
      })
    },
    unsubscribe() {
      if (this.listener) this.listener()
      this.listener = null
      this.items.splice(0)
    },
    async submit() {
      try {
        this.loading = true
        if (this.editMode === 'REGIST') await this.editItem.create()
        if (this.editMode === 'UPDATE') await this.editItem.update()
        if (this.editMode === 'DELETE') await this.editItem.delete()
        Object.keys(this.dialog).forEach((key) => {
          this.dialog[key] = false
        })
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
    openEditor(e, mode) {
      this.editItem.initialize(e)
      this.editMode = mode
      this.dialog.modify = true
    },
    submitAs(status) {
      this.editItem.status = status
      if (status === 'approved') {
        this.editItem.approvedDate = this.$dayjs().format('YYYY-MM-DD')
        this.editItem.approvedUid = this.$store.getters['auth/uid']
      }
      if (status === 'unapproved') {
        this.editItem.approvedDate = null
        this.editItem.approvedUid = null
      }
      this.submit()
    },
  },
}
</script>

<style></style>
