<script>
import { limit, orderBy, where } from 'firebase/firestore'
import { get, ref } from 'firebase/database'
import GDataTableAttendanceRecords from '../molecules/tables/GDataTableAttendanceRecords.vue'
import AttendanceRecord from '~/models/AttendanceRecord'
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
      items: [],
      loading: false,
      model: new AttendanceRecord(),
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
      const convert = async (data) => {
        const getEmployee = async (employeeId) => {
          const employee = this.fetchedEmployee.find(
            ({ docId }) => docId === employeeId
          )
          if (employee) return employee
          const dbRef = ref(this.$database, `Employees/${employeeId}`)
          const snapshot = await get(dbRef)
          if (!snapshot.exists())
            throw new Error(`Could not find employee. id: `, employeeId)
          return snapshot.val()
        }
        try {
          data.employee = await getEmployee(data.employeeId)
          return data
        } catch (err) {
          // eslint-disable-next-line
          console.error('Error fetching employee data:', err)
          data.employee = { fullName: 'error', code: 'error' }
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
          convert
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
        :loading="loading"
        :mobile-breakpoint="0"
        sort-by="overTimeTotal"
        sort-desc
      />
    </v-card-text>
  </v-card>
</template>

<style></style>
