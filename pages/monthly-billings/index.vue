<template>
  <g-template-default>
    <v-container>
      <v-card outlined>
        <v-toolbar flat>
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
            class="ml-4"
            :disabled="isCalculating || loading"
            :loading="isCalculating || loading"
            @click="recalc"
            >実績更新</v-btn
          >
        </v-toolbar>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-card outlined>
                <g-data-table
                  :headers="[
                    { text: '取引先', value: 'code' },
                    { text: '請求額', value: 'amount' },
                  ]"
                  :items="billingsByCustomer"
                  sort-by="code"
                ></g-data-table>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-container>
  </g-template-default>
</template>

<script>
import { getApp } from 'firebase/app'
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions'
import GDialogMonthPicker from '~/components/molecules/dialogs/GDialogMonthPicker.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import SiteBilling from '~/models/SiteBilling'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
export default {
  name: 'MonthlyBillings',
  components: { GDialogMonthPicker, GTemplateDefault, GDataTable },
  data() {
    return {
      items: [],
      listener: new SiteBilling(),
      loading: false,
      month: this.$dayjs().format('YYYY-MM'),
    }
  },
  computed: {
    isCalculating() {
      return this.$store.state.systems.calcSiteBillings?.status !== 'ready'
    },
    billingsByCustomer() {
      return Object.values(
        this.items.reduce((acc, item) => {
          if (acc[item.customerId]) {
            acc[item.customerId].amount += item.amount.operationResults
            acc[item.customerId].details.push(item)
          } else {
            const customer = this.$store.getters['customers/get'](
              item.customerId
            )
            acc[item.customerId] = {
              customerId: item.customerId,
              amount: item.amount.operationResults,
              code: customer.code,
              customer,
              details: [item],
            }
          }
          return acc
        }, {})
      )
    },
    /**
     * 集計対象の年月
     */
    months() {
      const currentDate = this.month
        ? this.$dayjs(`${this.month}-01`)
        : this.$dayjs().startOf('month')
      return [...Array(3)].map((_, i) =>
        currentDate.subtract(3 - (i + 1), 'month').format('YYYY-MM')
      )
    },
  },
  watch: {
    month: {
      handler(v) {
        this.subscribe()
      },
      immediate: true,
    },
  },
  methods: {
    subscribe() {
      this.items = this.listener.subscribeDocs([
        ['where', 'month', 'in', this.months],
      ])
    },
    unsubscribe() {
      this.listener.unsubscribe()
    },
    /**
     * 月別現場請求額更新処理
     */
    async recalc() {
      this.loading = true
      try {
        const firebaseApp = getApp()
        const functions = getFunctions(firebaseApp, 'asia-northeast1')
        if (process.env.NODE_ENV === 'local') {
          connectFunctionsEmulator(functions, 'localhost', 5001)
        }
        const func = httpsCallable(functions, 'maintenance-refreshSiteBillings')
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
