<script>
/**
 * ### GDataTableSiteContracts
 * 現場契約用DataTable
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      workShift: 'day',
      claimType: 'standard',
      prices: ['normal', 'half', 'canceled', 'overtime'],
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      return [
        { text: '適用開始日付', value: 'startDate', width: '132' },
        {
          text: '基本単価',
          value: `unitPrices.${this.workShift}.${this.claimType}.normal`,
          align: 'right',
          sortable: false,
          width: '82',
        },
        {
          text: '残業単価',
          value: `unitPrices.${this.workShift}.${this.claimType}.overtime`,
          align: 'right',
          sortable: false,
          width: '82',
        },
        {
          text: '半勤単価',
          value: `unitPrices.${this.workShift}.${this.claimType}.half`,
          align: 'right',
          sortable: false,
          width: '82',
        },
        {
          text: '中止単価',
          value: `unitPrices.${this.workShift}.${this.claimType}.canceled`,
          align: 'right',
          sortable: false,
          width: '82',
        },
      ]
    },
  },
}
</script>

<template>
  <v-data-table
    v-bind="$attrs"
    :headers="headers"
    hide-default-footer
    :items-per-page="-1"
    :mobile-breakpoint="0"
    sort-by="startDate"
    sort-desc
    v-on="$listeners"
  >
    <template #top>
      <div class="d-flex justify-end">
        <v-radio-group v-model="workShift" row hide-details>
          <v-radio label="日勤" value="day" />
          <v-radio label="夜勤" value="night" />
        </v-radio-group>
        <v-radio-group v-model="claimType" row hide-details>
          <v-radio label="資格なし" value="standard" />
          <v-radio label="資格あり" value="qualified" />
        </v-radio-group>
      </div>
    </template>
    <template
      v-for="price of prices"
      #[`item.unitPrices.${workShift}.${claimType}.${price}`]="{ item }"
    >
      {{ item.unitPrices[workShift][claimType][price].toLocaleString() }}
    </template>
  </v-data-table>
</template>

<style></style>
