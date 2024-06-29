<script>
/**
 * ### GSimpleTableSiteContract
 *
 * 現場の取極め情報のうち、単価情報を表示するTableコンポーネントです。
 *
 * @author shisyamo4131
 * @create 2024-06-28
 * @version 1.0.0
 */
import { props } from '~/models/SiteContract'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    UnitPrice: {
      props: {
        asOvertime: { type: Boolean, default: false, required: false },
        value: { type: Number, default: null, required: false },
      },
      computed: {
        text() {
          if (!this.value && this.value !== 0) return '-'
          return this.value.toLocaleString()
        },
      },
      render(createElement) {
        if (!this.asOvertime) {
          return createElement('div', `${this.text}`)
        } else {
          return createElement('div', `(${this.text})`)
        }
      },
    },
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props],
  props: {
    workShift: {
      type: String,
      default: 'day',
      validator: (v) => ['day', 'night'].includes(v),
      required: false,
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      divs: [
        { value: 'weekdays', text: '平日' },
        { value: 'saturday', text: '土曜' },
        { value: 'sunday', text: '日曜' },
        { value: 'holiday', text: '祝日' },
      ],
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    unitPrices() {
      return this[this.workShift].unitPrices
    },
  },
}
</script>

<template>
  <v-simple-table>
    <thead>
      <tr>
        <th>区分</th>
        <th style="text-align: right">通常</th>
        <th style="text-align: right">資格者</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(div, index) of divs" :key="`div-${index}`">
        <td>{{ div.text }}</td>
        <td style="text-align: right">
          <unit-price :value="unitPrices[div.value].standard.price" />
          <unit-price
            class="grey--text text--darken-1"
            :value="unitPrices[div.value].standard.overtime"
            as-overtime
          />
        </td>
        <td style="text-align: right">
          <unit-price :value="unitPrices[div.value].qualified.price" />
          <unit-price
            class="grey--text text--darken-1"
            :value="unitPrices[div.value].qualified.overtime"
            as-overtime
          />
        </td>
      </tr>
    </tbody>
  </v-simple-table>
</template>

<style></style>
