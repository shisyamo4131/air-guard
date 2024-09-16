<script>
// import { get, ref } from 'firebase/database'
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
      loading: false,
      month: this.$dayjs().format('YYYY-MM'),
      model: this.$AttendanceRecord(),
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
      const toolbar = 48 * 2 + 16
      const cardTextPadding = 16 * 2
      const footer = 68
      return vMain - mainContainerPadding - toolbar - cardTextPadding - footer
    },
    itemsPerPage() {
      return parseInt(this.height / 48) - 1
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    month: {
      handler() {
        this.fetch()
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async fetch() {
      // const callBack = async (item) => {
      //   try {
      //     const fetched = this.fetchedEmployee.find(
      //       ({ docId }) => docId === item.employeeId
      //     )
      //     if (fetched) {
      //       item.employee = fetched
      //     } else {
      //       const dbRef = ref(this.$database, `Employees/${item.employeeId}`)
      //       const snapshot = await get(dbRef)
      //       if (!snapshot.exists()) {
      //         item.employee = { fullName: 'error', code: 'error' }
      //       } else {
      //         const employeeData = { docId: item.employeeId, ...snapshot.val() }
      //         this.fetchedEmployee.push(employeeData)
      //         item.employee = employeeData
      //       }
      //     }
      //     return item
      //   } catch (err) {
      //     // eslint-disable-next-line
      //     console.error('Error fetching employee data:', err)
      //     item.employee = { fullName: 'error', code: 'error' }
      //   }
      // }
      this.loading = true
      try {
        this.items = await this.model.fetchDocs([
          ['where', 'month', '==', this.month],
        ])
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
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
      <template #extension>
        <g-dialog-month-picker v-model="month">
          <template #activator="{ attrs, on }">
            <v-text-field
              class="center-input"
              style="min-width: 96px; max-width: 96px"
              v-bind="attrs"
              label="年月"
              hide-details
              v-on="on"
            />
          </template>
        </g-dialog-month-picker>
      </template>
    </v-toolbar>
    <v-card flat outlined>
      <v-card-text>
        <g-data-table-attendance-records
          :height="height"
          :items="items"
          :items-per-page="itemsPerPage"
          :loading="loading"
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
