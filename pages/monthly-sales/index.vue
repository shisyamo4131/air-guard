<template>
  <g-template-index>
    <template #search>
      <g-dialog-month-picker v-model="month">
        <template #activator="{ attrs, on }">
          <v-text-field
            v-bind="attrs"
            class="center-input"
            style="max-width: 120px"
            flat
            solo-inverted
            dense
            hide-details
            :disabled="isCalculating"
            v-on="on"
          />
        </template>
      </g-dialog-month-picker>
      <v-btn
        color="primary"
        :disabled="isCalculating || loading"
        :loading="isCalculating || loading"
        @click="recalc"
        >実績更新</v-btn
      >
      <v-spacer />
    </template>
  </g-template-index>
</template>

<script>
import { getApp } from 'firebase/app'
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions'
import GDialogMonthPicker from '~/components/molecules/dialogs/GDialogMonthPicker.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
export default {
  components: { GTemplateIndex, GDialogMonthPicker },
  data() {
    return {
      loading: false,
      month: this.$dayjs().format('YYYY-MM'),
    }
  },
  computed: {
    isCalculating() {
      return this.$store.state.systems.calcMonthlySales?.status !== 'ready'
    },
  },
  methods: {
    async recalc() {
      this.loading = true
      try {
        const firebaseApp = getApp()
        const functions = getFunctions(firebaseApp, 'asia-northeast1')
        if (process.env.NODE_ENV === 'local') {
          connectFunctionsEmulator(functions, 'localhost', 5001)
        }
        const func = httpsCallable(functions, 'maintenance-refreshMonthlySales')
        const result = await func({ month: this.month })
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
