<template>
  <v-container>
    <v-card>
      <v-list>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title> インデックスの再構築 </v-list-item-title>
            <v-list-item-subtitle>
              Realtime
              DatabaseのCustomers、Sites、Employeesインデックスを再構築します。
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn :disabled="loading" :loading="loading" @click="refreshIndex"
              >Refresh Index</v-btn
            >
          </v-list-item-action>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title> 出勤簿の再作成 </v-list-item-title>
            <v-list-item-subtitle>
              全従業員の出勤簿を再作成します。
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn
              :disabled="loading"
              :loading="loading"
              @click="refreshDailyAttendances"
              >Refresh Daily Attendances</v-btn
            >
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>

<script>
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions'
import { getApp } from 'firebase/app'
export default {
  data() {
    return {
      loading: false,
    }
  },
  methods: {
    async refreshIndex() {
      this.loading = true
      // インデックスデータに対する購読を一旦解除
      this.$store.dispatch('customers/unsubscribe')
      this.$store.dispatch('sites/unsubscribe')
      this.$store.dispatch('employees/unsubscribe')
      try {
        const firebaseApp = getApp()
        const functions = getFunctions(firebaseApp, 'asia-northeast1')
        if (process.env.NODE_ENV === 'local') {
          connectFunctionsEmulator(functions, 'localhost', 5001)
        }
        const func = httpsCallable(functions, 'maintenance-refreshIndex')
        const result = await func({ indexType: 'all' })
        console.info(result.data.message) // eslint-disable-line no-console
      } catch (err) {
        console.error('Error calling function:', err) // eslint-disable-line no-console
      } finally {
        await this.$store.dispatch('customers/subscribe')
        await this.$store.dispatch('sites/subscribe')
        await this.$store.dispatch('employees/subscribe')
        this.loading = false
      }
    },
    async refreshDailyAttendances() {
      this.loading = true
      try {
        const firebaseApp = getApp()
        const functions = getFunctions(firebaseApp, 'asia-northeast1')
        if (process.env.NODE_ENV === 'local') {
          connectFunctionsEmulator(functions, 'localhost', 5001)
        }
        const func = httpsCallable(
          functions,
          'maintenance-refreshDailyAttendances'
        )
        const result = await func({ from: '2017-04-23', to: '2017-04-29' })
        console.info(result.data.message) // eslint-disable-line no-console
      } catch (err) {
        console.error('Error calling function:', err) // eslint-disable-line no-console
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style></style>
