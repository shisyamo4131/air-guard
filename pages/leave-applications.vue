<script>
import { collection, onSnapshot } from 'firebase/firestore'
import GIconClose from '~/components/atoms/icons/GIconClose.vue'
import GIconSubmit from '~/components/atoms/icons/GIconSubmit.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import GBtnRegistIcon from '~/components/molecules/btns/GBtnRegistIcon.vue'
import GInputLeaveApplication from '~/components/molecules/inputs/GInputLeaveApplication.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'LeaveApplicationIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTable,
    GBtnRegistIcon,
    GInputLeaveApplication,
    GIconClose,
    GIconSubmit,
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      editMode: 'REGIST',
      form: null,
      items: [],
      listener: null,
      loading: false,
      model: this.$LeaveApplication(),
      scrollTarget: null,
    }
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog: {
      handler(v) {
        v || this.initialize()
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * MOUNTED
   ***************************************************************************/
  mounted() {
    this.subscribe()
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
      const colRef = collection(this.$firestore, 'LeaveApplications')
      this.listener = onSnapshot(colRef, (snapshot) => {
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
        this.dialog = false
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
      this.dialog = true
    },
    onClickDelete(item) {
      this.model.initialize(item)
      this.editMode = 'DELETE'
      this.dialog = true
    },
  },
}
</script>

<template>
  <div>
    <v-toolbar :color="$vuetify.theme.themes.light.background" flat>
      <v-dialog v-model="dialog" max-width="600" persistent scrollable>
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon v-bind="attrs" color="primary" v-on="on" />
        </template>
        <v-card>
          <v-toolbar dense flat color="primary" dark>
            <v-toolbar-title>休暇申請[登録]</v-toolbar-title>
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
            <v-btn :disabled="loading" @click="dialog = false"
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
        :actions="['edit', 'delete']"
        :headers="[
          { text: '申請日', value: 'requestDate', width: 120 },
          { text: '申請者', value: 'employee.abbr' },
          {
            text: '状態',
            value: 'status',
            width: 84,
            sortable: false,
            align: 'center',
          },
        ]"
        :items="items"
        @click:edit="onClickEdit"
        @click:delete="onClickDelete"
      >
        <template #[`item.status`]="{ item }">
          <v-chip small>{{ $LEAVE_APPLICATION_STATUS[item.status] }}</v-chip>
        </template>
      </g-data-table>
    </v-container>
  </div>
</template>

<style></style>
