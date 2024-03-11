<template>
  <g-template-default>
    <v-container>
      <g-data-table-site-unit-prices :items="items" />
    </v-container>
  </g-template-default>
</template>

<script>
import GDataTableSiteUnitPrices from '~/components/molecules/tables/GDataTableSiteContracts.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  components: { GTemplateDefault, GDataTableSiteUnitPrices },
  data() {
    return {
      model: this.$SiteContract('aaa'),
      unitPrices: {
        day: {
          standard: {
            normal: 16500,
            half: 8250,
            canceled: 11550,
            overtime: 2580,
          },
          qualified: {
            normal: 19500,
            half: 9750,
            canceled: 13650,
            overtime: 3050,
          },
        },
        night: {
          standard: {
            normal: 19000,
            half: 9500,
            canceled: 13300,
            overtime: 2970,
          },
          qualified: {
            normal: 21000,
            half: 10500,
            canceled: 14700,
            overtime: 3280,
          },
        },
      },
    }
  },
  computed: {
    items() {
      return [...Array(5)].map((_, i) => {
        const date = this.$dayjs().add(i, 'd').format('YYYY-MM-DD')
        const unitPrices = this.unitPrices
        return {
          startDate: date,
          unitPrices,
        }
      })
    },
  },
}
</script>

<style></style>
