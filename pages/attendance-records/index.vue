<script>
import { collection, getDocs, query, where } from 'firebase/firestore'
import { get, ref } from 'firebase/database'
import GDataTableAttendanceRecords from '~/components/molecules/tables/GDataTableAttendanceRecords.vue'
import GDialogMonthPicker from '~/components/molecules/dialogs/GDialogMonthPicker.vue'
/**
 * ### page.AttendanceRecordsIndex
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'AttendanceRecordsIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTableAttendanceRecords, GDialogMonthPicker },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      fetchedEmployee: [],
      items: [],
      month: this.$dayjs().format('YYYY-MM'),
      page: 1,
      pageCount: 1,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    height() {
      const vMain = this.$vuetify.breakpoint.height - 48
      const mainContainerPadding = 12 * 2
      const titleBar = 48 + 16
      const cardTextPadding = 16 * 2
      const footer = 68
      return vMain - mainContainerPadding - titleBar - cardTextPadding - footer
    },
    itemsPerPage() {
      return parseInt(this.height / 48) - 1
    },
  },
  /***************************************************************************
   * MOUNTED
   ***************************************************************************/
  mounted() {
    this.fetch()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async getEmployee(employeeId) {
      const fethced = this.fetchedEmployee.find(
        ({ docId }) => docId === employeeId
      )
      if (fethced) return fethced
      const dbRef = ref(this.$database, `Employees/${employeeId}`)
      const snapshot = await get(dbRef)
      if (!snapshot.exists()) return undefined
      this.fetchedEmployee.push({ docId: employeeId, ...snapshot.val() })
      return snapshot.val()
    },
    async fetch() {
      this.items.splice(0)
      const colRef = collection(this.$firestore, 'AttendanceRecords')
      const q = query(colRef, where('month', '==', this.month))
      const querySnapshot = await getDocs(q)
      querySnapshot.docs.forEach(async (doc) => {
        const item = doc.data()
        item.nonStatutoryOverTime /= 60
        item.holidayWorkingTime /= 60
        item.employee = await this.getEmployee(item.employeeId)
        this.items.push(item)
      })
    },
  },
}
</script>

<template>
  <v-container fluid>
    <v-toolbar class="mb-4" dense flat>
      <v-toolbar-title class="g-card__title">
        {{ `従業員別勤怠実績` }}
      </v-toolbar-title>
    </v-toolbar>
    <g-dialog-month-picker />
    <v-card flat outlined>
      <v-card-text>
        <g-data-table-attendance-records
          :height="height"
          :items="items"
          :items-per-page="itemsPerPage"
          :mobile-breakpoint="0"
          :page.sync="page"
          @page-count="pageCount = $event"
        />
      </v-card-text>
    </v-card>
    <v-footer
      class="justify-center"
      fixed
      padless
      style="background-color: transparent"
    >
      <v-container>
        <v-pagination v-model="page" :length="pageCount" />
      </v-container>
    </v-footer>
  </v-container>
</template>

<style></style>
