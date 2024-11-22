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
import GSelect from '~/components/atoms/inputs/GSelect.vue'

const firebaseApp = getApp()
const functions = getFunctions(firebaseApp, 'asia-northeast1')

export default {
  components: { GSelect },
  data() {
    return {
      collection: 'all',
      collections: [
        { text: 'すべて', value: 'all' },
        { text: '取引先', value: 'Customers' },
        { text: '現場', value: 'Sites' },
        { text: '従業員', value: 'Employees' },
        { text: '外注先', value: 'Outsourcers' },
      ],
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
        this.$store.dispatch('outsourcers/unsubscribe')
        if (process.env.NODE_ENV === 'local') {
          connectFunctionsEmulator(functions, 'localhost', 5001)
        }
        const func = httpsCallable(functions, this.funcName)
        const result = await func({ indexType: this.collection })
        console.info(result.data.message) // eslint-disable-line no-console
      } catch (err) {
        console.error('Error calling function:', err) // eslint-disable-line no-console
      } finally {
        await this.$store.dispatch('customers/subscribe')
        await this.$store.dispatch('sites/subscribe')
        await this.$store.dispatch('employees/subscribe')
        await this.$store.dispatch('outsourcers/subscribe')
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
    <v-card-text>
      <g-select v-model="collection" :items="collections" />
    </v-card-text>
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
