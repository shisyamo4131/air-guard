<script>
import { collectionGroup, onSnapshot, query, where } from 'firebase/firestore'
import { get, ref } from 'firebase/database'
/**
 * GLeaveApplicationTable
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    length: { type: [String, Number], default: '4', required: false },
    startAt: {
      type: String,
      default: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substring(0, 10),
      required: false,
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dates: [],
      items: [],
      listener: null,
    }
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    startAt: {
      handler(v) {
        const length = parseInt(this.length)
        this.dates = Array.from({ length }, (_, i) => {
          return this.$dayjs(v).add(i, 'day').format('YYYY-MM-DD')
        })
        this.subscribe()
      },
      immediate: true,
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
    async getEmployee(docId) {
      const dbRef = ref(this.$database, `Employees/${docId}`)
      const snapshot = await get(dbRef)
      return snapshot.exists() ? snapshot.val() : undefined
    },
    subscribe() {
      this.items.splice(0)
      const colRef = collectionGroup(
        this.$firestore,
        'EmployeeLeaveApplications'
      )
      const q = query(colRef, where('docId', 'in', this.dates))
      this.listener = onSnapshot(q, (querySnapshot) => {
        querySnapshot.docChanges().forEach(async (change) => {
          const item = change.doc.data()
          const index = this.items.findIndex(
            ({ docId, employeeId }) =>
              docId === item.docId && employeeId === item.employeeId
          )
          item.employee = await this.getEmployee(item.employeeId)
          if (change.type === 'added') this.items.push(item)
          if (change.type === 'modified') this.items.splice(index, 1, item)
          if (change.type === 'removed') this.items.splice(index, 1)
        })
      })
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title class="g-card__title"> 休暇申請 </v-card-title>
    <v-simple-table>
      <thead>
        <tr>
          <th v-for="date of dates" :key="date" style="min-width: 120px">
            {{ $dayjs(date).format('MM月DD日(ddd)') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td v-for="date of dates" :key="date">
            <div class="d-flex flex-wrap my-1" style="gap: 4px">
              <div
                v-for="(item, index) of items.filter(
                  (item) => item.docId === date
                )"
                :key="index"
              >
                <v-chip color="primary" label small>
                  {{ item?.employee?.abbr || 'error' }}
                </v-chip>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </v-simple-table>
  </v-card>
</template>

<style></style>
