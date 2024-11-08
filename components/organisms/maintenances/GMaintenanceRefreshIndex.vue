<script>
/**
 * Realtime Database の Customers, Sites, Employees インデックスを再構築します。
 */
import { getApp } from 'firebase/app'
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions'

const firebaseApp = getApp()
const functions = getFunctions(firebaseApp, 'asia-northeast1')

export default {
  data() {
    return {
      loading: false,
      funcName: 'maintenance-refreshIndex',
    }
  },

  methods: {
    async submit() {
      this.loading = true
      try {
        // インデックスデータに対する購読を一旦解除
        this.$store.dispatch('customers/unsubscribe')
        this.$store.dispatch('sites/unsubscribe')
        this.$store.dispatch('employees/unsubscribe')
        if (process.env.NODE_ENV === 'local') {
          connectFunctionsEmulator(functions, 'localhost', 5001)
        }
        const func = httpsCallable(functions, this.funcName)
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
  },
}
</script>

<template>
  <v-card outlined>
    <v-card-title> インデックスの再構築 </v-card-title>
    <v-card-subtitle>
      Realtime DatabaseのCustomers、Sites、Employeesインデックスを再構築します。
    </v-card-subtitle>
    <v-divider />
    <v-card-actions class="justify-end">
      <v-btn
        color="primary"
        :disabled="loading"
        :loading="loading"
        @click="submit"
        >実行</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<style></style>
