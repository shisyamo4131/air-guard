<template>
  <v-container>
    <g-card-site-contract v-bind="model" />
    {{ model.day.unitPrices.weekdays.standard }}
  </v-container>
</template>

<script>
import GCardSiteContract from '~/components/molecules/cards/GCardSiteContract.vue'
export default {
  components: {
    GCardSiteContract,
  },
  data() {
    return {
      hoge: {
        hogehoge: 'a',
        prop1: {
          prop2: {
            prop3: 'aaa',
          },
        },
      },
      model: {
        siteId: '',
        startDate: '2024-01-01',
        day: {
          startAt: '08:00',
          endAt: '17:00',
          endAtNextday: false,
          breakTime: 60,
          unitPrices: {
            weekdays: {
              standard: { price: 17000, overtime: 2660 },
              qualified: { price: 19500, overtime: 3000 },
            },
            saturday: {
              standard: { price: 20000, overtime: 3130 },
              qualified: { price: 22500, overtime: 3500 },
            },
            sunday: {
              standard: { price: 20000, overtime: 3130 },
              qualified: { price: 22500, overtime: 3500 },
            },
            holiday: {
              standard: { price: 20000, overtime: 3130 },
              qualified: { price: 22500, overtime: 3500 },
            },
          },
        },
        night: {
          startAt: '20:00',
          endAt: '05:00',
          endAtNextday: true,
          breakTime: 60,
          unitPrices: {
            weekdays: {
              standard: { price: 25000, overtime: 2660 },
              qualified: { price: 19500, overtime: 3000 },
            },
            saturday: {
              standard: { price: 20000, overtime: 3130 },
              qualified: { price: 22500, overtime: 3500 },
            },
            sunday: {
              standard: { price: 20000, overtime: 3130 },
              qualified: { price: 22500, overtime: 3500 },
            },
            holiday: {
              standard: { price: 20000, overtime: 3130 },
              qualified: { price: 22500, overtime: 3500 },
            },
          },
        },
        halfRate: 0.5,
        cancelRate: 1,
        remarks: '',
      },
    }
  },
}
</script>

<style></style>
