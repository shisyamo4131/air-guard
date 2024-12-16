<script>
import { getApp } from 'firebase/app'
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions'
import GChartSales from '~/components/atoms/charts/GChartSales.vue'
import DailySale from '~/models/DailySale'
import GDataTableMonthlySalesByCustomer from '~/components/molecules/tables/GDataTableMonthlySalesByCustomer.vue'
import GTemplateFixed from '~/components/templates/GTemplateFixed.vue'
import GTextFieldMonth from '~/components/molecules/inputs/GTextFieldMonth.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'MonthlySales',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GChartSales,
    GDataTableMonthlySalesByCustomer,
    GTemplateFixed,
    GTextFieldMonth,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      listener: new DailySale(),
      loading: false,
      month: this.$dayjs().format('YYYY-MM'),
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    status() {
      const lastExecutedAt =
        this.$store.state.systems?.calcMonthlySales?.lastExecutedAt || null
      if (!lastExecutedAt) return null
      const result = this.$dayjs(lastExecutedAt).format('YYYY-MM-DD HH:mm:ss')
      return result
    },

    isCalculating() {
      return this.$store.state.systems.calcMonthlySales?.status !== 'ready'
    },

    /**
     * 集計対象の年月
     */
    months() {
      const currentDate = this.month
        ? this.$dayjs(`${this.month}-01`)
        : this.$dayjs().startOf('month')
      return [...Array(6)].map((_, i) =>
        currentDate.subtract(6 - (i + 1), 'month').format('YYYY-MM')
      )
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    month: {
      handler(v) {
        this.subscribe()
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
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
     * 月次売上更新処理
     */
    async recalc() {
      this.loading = true
      try {
        this.unsubscribe()
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
        this.subscribe()
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <g-template-fixed v-slot="{ height }">
    <v-sheet class="d-flex flex-column overflow-y-hidden" :height="height">
      <v-toolbar class="flex-grow-0" color="secondary" flat dense dark>
        <v-icon left>mdi-currency-jpy</v-icon>
        <v-toolbar-title>月次売上</v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn
            :disabled="isCalculating || loading"
            :loading="isCalculating || loading"
            text
            @click="recalc"
            ><v-icon left>mdi-update</v-icon>実績更新</v-btn
          >
        </v-toolbar-items>
      </v-toolbar>
      <v-toolbar class="flex-grow-0" flat>
        <g-text-field-month
          v-model="month"
          :options="{
            outlined: false,
            soloInverted: true,
            hideDetails: true,
            flat: true,
          }"
        />
        <v-spacer />
        <div class="flex-grow-0 px-4 text-right text-subtitle-2 grey--text">
          <div>最終更新:</div>
          <div>{{ status }}</div>
        </div>
      </v-toolbar>
      <v-divider />
      <v-container class="flex-grow-1 overflow-y-auto">
        <v-row>
          <!-- 売上推移 -->
          <v-col cols="12" md="6" xl="4" class="d-flex">
            <v-card outlined class="flex-grow-1">
              <v-card-title>
                <v-icon color="primary" left>mdi-chart-bar</v-icon
                >売上推移</v-card-title
              >
              <!-- DIV で括らないと縦に伸び続けてしまう -->
              <div>
                <g-chart-sales :items="items" :month="month" />
              </div>
            </v-card>
          </v-col>

          <!-- 売上TOP5 -->
          <v-col cols="12" md="6" xl="4" class="d-flex">
            <v-card outlined class="flex-grow-1">
              <v-card-title>
                <v-icon color="primary" left>mdi-podium</v-icon
                >売上TOP5</v-card-title
              >
              <g-data-table-monthly-sales-by-customer
                :items="items"
                :month="month"
                type="top5"
                :mobile-breakpoint="0"
              />
            </v-card>
          </v-col>

          <!-- 取引先別売上高 -->
          <v-col cols="12" xl="4">
            <v-card outlined>
              <v-card-title
                ><v-icon color="primary" left>mdi-currency-usd</v-icon
                >取引先別売上高</v-card-title
              >
              <g-data-table-monthly-sales-by-customer
                :items="items"
                :month="month"
                :mobile-breakpoint="0"
              />
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>
  </g-template-fixed>
</template>

<style></style>
