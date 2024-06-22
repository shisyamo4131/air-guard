<script>
import { collectionGroup, onSnapshot, query, where } from 'firebase/firestore'
import { get, ref } from 'firebase/database'
/**
 * ### GLauncherLeaveApplications
 * @author shisyamo4131
 * @create 2024-06-17
 * @update 2024-06-22   dayjsのlocaleの変更方法がグローバルになっていたのをローカルに変更。
 */
import ja from 'dayjs/locale/ja'
export default {
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      leaveApplications: [],
      listener: null,
      tab: 0,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    dates() {
      return Array.from({ length: 3 }, (_, index) => {
        return this.$dayjs().add(index, 'day').format('YYYY-MM-DD')
      })
    },
    items() {
      return this.dates.reduce((acc, date) => {
        const leaveApplications = this.leaveApplications.filter(
          ({ docId }) => docId === date
        )
        const dateJp = this.$dayjs(date).locale(ja).format('MM月DD日（ddd）')
        acc[date] = {
          date,
          dateJp,
        }
        this.$set(acc[date], 'leaveApplications', leaveApplications)
        return acc
      }, {})
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
    this.detach()
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
    detach() {
      this.leaveApplications.splice(0)
      if (this.listener) this.listener()
    },
    subscribe() {
      this.detach()
      const colRef = collectionGroup(
        this.$firestore,
        'EmployeeLeaveApplications'
      )
      const q = query(colRef, where('docId', 'in', this.dates))
      this.listener = onSnapshot(q, (querySnapshot) => {
        querySnapshot.docChanges().forEach(async (change) => {
          const item = change.doc.data()
          const index = this.leaveApplications.findIndex(
            ({ docId, employeeId }) =>
              docId === item.docId && employeeId === item.employeeId
          )
          item.employee = await this.getEmployee(item.employeeId)
          if (change.type === 'added') this.leaveApplications.push(item)
          if (change.type === 'modified')
            this.leaveApplications.splice(index, 1, item)
          if (change.type === 'removed') this.leaveApplications.splice(index, 1)
        })
      })
    },
  },
}
</script>

<template>
  <v-card>
    <v-card-title class="g-card__title">休暇申請</v-card-title>
    <v-card-subtitle>今日から3日間の休暇申請を表示します。</v-card-subtitle>
    <v-tabs
      v-model="tab"
      background-color="transparent"
      center-active
      color="primary"
      grow
      show-arrows
    >
      <v-tab v-for="item in items" :key="`tab-${item.date}`">
        {{ item.dateJp }}
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item v-for="item in items" :key="`tab-item-${item.date}`">
        <v-card color="basil" flat>
          <v-card-text v-if="!!item.leaveApplications.length">
            <div class="d-flex flex-wrap" style="gap: 8px">
              <v-btn
                v-for="leaveApplication in item.leaveApplications"
                :key="leaveApplication.employeeId"
                color="primary lighten-1"
                outlined
                small
                @click="
                  $router.push({
                    path: 'leave-applications',
                    query: { employeeId: leaveApplication.employeeId },
                  })
                "
              >
                <span
                  class="text-truncate"
                  style="min-width: 72px; max-width: 72px"
                >
                  {{ leaveApplication.employee.fullName }}
                </span>
              </v-btn>
            </div>
          </v-card-text>
          <v-card-text v-else> 休暇申請はありません。 </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<style></style>
