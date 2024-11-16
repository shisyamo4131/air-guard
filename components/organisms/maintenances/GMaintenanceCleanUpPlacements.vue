<script>
/**
 * Realtime Database の Placements データを削除します。
 */
import { getApp } from 'firebase/app'
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions'
import GTextField from '~/components/atoms/inputs/GTextField.vue'

const firebaseApp = getApp()
const functions = getFunctions(firebaseApp, 'asia-northeast1')

export default {
  components: { GTextField },
  data() {
    return {
      date: null,
      isValid: false,
      loading: false,
      funcName: 'maintenance-cleanUpPlacements',
    }
  },

  methods: {
    async submit() {
      this.loading = true
      try {
        if (process.env.NODE_ENV === 'local') {
          connectFunctionsEmulator(functions, 'localhost', 5001)
        }
        const func = httpsCallable(functions, this.funcName)
        const result = await func({ date: this.date })
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

<template>
  <v-card outlined>
    <v-card-title> 配置情報データの削除 </v-card-title>
    <v-card-subtitle>
      基準日以前のRealtime Databaseの配置情報データを削除します。
    </v-card-subtitle>
    <v-divider />
    <v-card-text>
      <v-form v-model="isValid">
        <g-text-field
          v-model="date"
          label="基準日"
          input-type="date"
          required
        />
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <v-btn
        color="primary"
        :disabled="loading || !isValid"
        :loading="loading"
        @click="submit"
        >実行</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<style></style>
