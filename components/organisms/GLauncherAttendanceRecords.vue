<template>
  <v-card>
    <v-card-title class="g-card__title">
      {{ `従業員別勤怠実績 [${month}]` }}
    </v-card-title>
    <v-card-text>
      <g-data-table
        :headers="headers"
        fixed-header
        height="360"
        :items="items"
        sort-by="employee.code"
        :mobile-breakpoint="0"
        :items-per-page="-1"
      >
        <template #[`item.nonStatutoryOverTime`]="{ item }">
          {{ item.nonStatutoryOverTime / 60 }}
        </template>
        <template #[`item.holidayWorkingTime`]="{ item }">
          {{ item.holidayWorkingTime / 60 }}
        </template>
        <template #[`item.overTimeTotal`]="{ item }">
          {{ (item.nonStatutoryOverTime + item.holidayWorkingTime) / 60 }}
        </template>
      </g-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import GDataTable from '../atoms/tables/GDataTable.vue'
export default {
  components: { GDataTable },
  data() {
    return {
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
          sortable: false,
          align: 'right',
          width: 120,
        },
      ],
      items: [],
      month: this.$dayjs().format('YYYY-MM'),
    }
  },
  mounted() {
    this.fetch()
  },
  methods: {
    async getEmployee(employeeId) {
      const docRef = doc(this.$firestore, `Employees/${employeeId}`)
      const snapshot = await getDoc(docRef)
      return snapshot.exists() ? snapshot.data() : undefined
    },
    async fetch() {
      this.items.splice(0)
      const colRef = collection(this.$firestore, 'AttendanceRecords')
      const q = query(colRef, where('month', '==', this.month))
      const querySnapshot = await getDocs(q)
      querySnapshot.docs.forEach(async (doc) => {
        const item = doc.data()
        item.employee = await this.getEmployee(item.employeeId)
        this.items.push(item)
      })
    },
  },
}
</script>

<style></style>
