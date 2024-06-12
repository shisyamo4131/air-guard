<script>
import { limit, orderBy, where } from 'firebase/firestore'
import { get, ref } from 'firebase/database'
import GDataTableAttendanceRecords from '../molecules/tables/GDataTableAttendanceRecords.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTableAttendanceRecords },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      fetchedEmployee: [],
      headers: [
        { text: 'CODE', value: 'employee.code', width: 96 },
        { text: '従業員', value: 'employee.fullName', sortable: false },
        {
          text: '所定労働日数',
          value: 'scheduledWorkingDays',
          sortable: false,
          align: 'right',
          width: 120,
        },
        {
          text: '法定外残業時間',
          value: 'nonStatutoryOverTime',
          sortable: false,
          align: 'right',
          width: 120,
        },
        {
          text: '休日出勤時間',
          value: 'holidayWorkingTime',
          sortable: false,
          align: 'right',
          width: 120,
        },
        {
          text: '合計',
          value: 'overTimeTotal',
          align: 'right',
          width: 120,
        },
      ],
      items: [],
      loading: false,
      model: this.$AttendanceRecord(),
      month: this.$dayjs().format('YYYY-MM'),
    }
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
    async fetch() {
      const callBack = async (item) => {
        try {
          const fetched = this.fetchedEmployee.find(
            ({ docId }) => docId === item.employeeId
          )
          if (fetched) {
            item.employee = fetched
          } else {
            const dbRef = ref(this.$database, `Employees/${item.employeeId}`)
            const snapshot = await get(dbRef)
            if (!snapshot.exists()) {
              item.employee = { fullName: 'error', code: 'error' }
            } else {
              const employeeData = { docId: item.employeeId, ...snapshot.val() }
              this.fetchedEmployee.push(employeeData)
              item.employee = employeeData
            }
          }
        } catch (err) {
          // eslint-disable-next-line
          console.error('Error fetching employee data:', err)
          item.employee = { fullName: 'error', code: 'error' }
        }
      }
      this.loading = true
      try {
        this.items = await this.model.fetchDocs(
          undefined,
          [
            where('month', '==', this.month),
            orderBy('overTimeTotal', 'desc'),
            limit(5),
          ],
          callBack
        )
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
  <v-card>
    <v-card-title class="g-card__title">
      {{ `時間外TOP5 [${month}]` }}
      <v-spacer />
      <v-btn icon color="primary" @click="$router.push('attendance-records')"
        ><v-icon>mdi-open-in-new</v-icon></v-btn
      >
    </v-card-title>
    <v-card-text>
      <g-data-table-attendance-records
        :items="items"
        :mobile-breakpoint="0"
        sort-by="overTimeTotal"
        sort-desc
      />
    </v-card-text>
  </v-card>
</template>

<style></style>
