<template>
  <g-template-default label="申請管理">
    <template #append-toolbar-title>
      <v-spacer />
      <v-toolbar-items>
        <v-dialog v-model="dialog.create" max-width="600" scrollable>
          <template #activator="{ attrs, on }">
            <v-btn v-bind="attrs" text v-on="on">
              <v-icon>mdi-plus</v-icon>
              <span>登録</span>
            </v-btn>
          </template>
          <g-card-input-form
            ref="form"
            label="申請登録"
            :loading="loading"
            @click:cancel="dialog.create = false"
            @click:submit="submit"
          >
            <template #default>
              <g-input-application
                v-bind.sync="editItem"
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
                v-model="search.applicationType"
                label="申請区分"
                :items="$APPLICATION_TYPE_ARRAY"
              />
            </v-col>
            <v-col>
              <a-select
                v-model="search.applicationStatus"
                label="状態"
                :items="$APPLICATION_STATUS_ARRAY"
              />
            </v-col>
          </v-row>
        </v-toolbar>
        <v-data-table :headers="headers" :items="items" @click:row="onClickRow">
          <template #[`item.applicationType`]="{ item }">
            {{ $APPLICATION_TYPE[item.applicationType] }}
          </template>
          <template #[`item.employeeId`]="{ item }">
            {{ $store.getters['masters/Employee'](item.employeeId).abbr }}
          </template>
          <template #[`item.status`]="{ item }">
            {{ $APPLICATION_STATUS[item.status] }}
          </template>
          <template #[`item.actions`]>
            <v-icon>mdi-magnify</v-icon>
          </template>
        </v-data-table>
      </v-container>
      <!-- dialog to approve or reject application. -->
      <v-dialog v-model="dialog.approve" max-width="600">
        <g-card-input-form
          ref="form-approve"
          label="申請承認"
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
import GInputApplication from '~/components/molecules/inputs/GInputApplication.vue'
import GInputApplicationApprove from '~/components/molecules/inputs/GInputApplicationApprove.vue'
export default {
  components: {
    GTemplateDefault,
    GCardInputForm,
    ASelect,
    GInputApplication,
    GInputApplicationApprove,
  },
  data() {
    return {
      dialog: {
        create: false,
        approve: false,
        unapprove: false,
      },
      headers: [
        { text: '申請日', value: 'applicationDate' },
        { text: '申請区分', value: 'applicationType' },
        { text: '申請者', value: 'employeeId' },
        { text: '状態', value: 'status' },
        { text: 'actions', value: 'actions', sortable: false, align: 'center' },
      ],
      editItem: this.$Application(),
      editMode: 'REGIST',
      items: [],
      listener: null,
      loading: false,
      search: {
        applicationType: 'vacation',
        applicationStatus: 'unapproved',
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
      this.$refs.form.initialize()
      this.editItem.initialize()
      this.editMode = 'REGIST'
    },
    'dialog.approve'(v) {
      if (v) return
      this.$refs['form-approve'].initialize()
      this.editItem.initialize()
      this.editMode = 'REGIST'
    },
    'search.applicationType': {
      handler(v) {
        this.subscribe()
      },
      immediate: true,
    },
    'search.applicationStatus': {
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
      const colRef = collection(this.$firestore, 'Applications')
      const q = query(
        colRef,
        where('applicationType', '==', this.search.applicationType),
        where('status', '==', this.search.applicationStatus)
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
    onClickRow(e) {
      this.editItem.initialize(e)
      this.editMode = 'UPDATE'
      if (e.status === 'unapproved') this.dialog.approve = true
      if (e.status === 'approved') this.dialog.unapprove = true
    },
    submitAs(status) {
      this.editItem.status = status
      if (status === 'approved') {
        this.editItem.approvedDate = this.$dayjs().format('YYYY-MM-DD')
        this.editItem.approvedId = this.$store.getters['auth/uid']
      }
      if (status === 'unapproved') {
        this.editItem.approvedDate = null
        this.editItem.approvedId = null
      }
      this.submit()
    },
  },
}
</script>

<style></style>
