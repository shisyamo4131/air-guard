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
      dayDiv: 'weekdays',
      claimType: 'standard',
      prices: ['price', 'overtime'],
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      return [
        { text: '適用開始日付', value: 'startDate', width: '132' },
        { text: '勤務区分', value: 'workShift' },
        { text: '開始時刻', value: 'startAt' },
        { text: '終了時刻', value: 'endAt' },
        { text: '休憩時間', value: 'breakTime' },
        { text: '実働時間', value: 'workTime' },
        {
          text: '基本単価',
          value: `unitPrices.${this.dayDiv}.${this.claimType}.price`,
          sortable: false,
        },
        {
          text: '残業単価',
          value: `unitPrices.${this.dayDiv}.${this.claimType}.overtime`,
          sortable: false,
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
    sort-by="startDate"
    sort-desc
    v-on="$listeners"
  >
    <template #top>
      <div class="d-flex justify-end">
        <v-radio-group v-model="dayDiv" row>
          <v-radio label="平日" value="weekdays" />
          <v-radio label="土曜" value="saturday" />
          <v-radio label="日曜" value="sunday" />
          <v-radio label="祝日" value="holiday" />
        </v-radio-group>
        <v-divider class="mr-3" vertical />
        <v-radio-group v-model="claimType" row>
          <v-radio label="資格なし" value="standard" />
          <v-radio label="資格あり" value="qualified" />
        </v-radio-group>
      </div>
    </template>
    <template #[`item.workShift`]="{ item }">
      {{ $WORK_SHIFT[item.workShift] }}
    </template>
    <template
      v-for="price of prices"
      #[`item.unitPrices.${dayDiv}.${claimType}.${price}`]="{ item }"
    >
      {{ item.unitPrices[dayDiv][claimType][price].toLocaleString() }}
    </template>
  </v-data-table>
</template>

<style></style>
