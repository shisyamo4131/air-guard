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
      this.$store.dispatch('sites/unsubscribe')
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
        this.$store.dispatch('sites/subscribe')
        this.loading = false
      }
    },
  },
}
</script>

<style></style>
