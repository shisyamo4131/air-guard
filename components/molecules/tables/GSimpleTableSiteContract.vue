<script>
/**
 * ### GSimpleTableSiteContract
 *
 * 現場の取極め情報のうち、単価情報を表示するTableコンポーネントです。
 *
 * @updates
 * - version 1.0.0 - 2024-07-12 - 初版作成
 *
 * @author shisyamo4131
 * @version 1.0.0
 */
import { vueProps } from '~/models/propsDefinition/SiteContract'
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
  mixins: [vueProps],
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
}
</script>

<template>
  <v-simple-table>
    <thead>
      <tr>
        <th></th>
        <th style="text-align: center">通常</th>
        <th style="text-align: center">資格者</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(div, index) of divs" :key="`div-${index}`">
        <td style="text-align: center">{{ div.text }}</td>
        <td style="text-align: center">
          <unit-price :value="unitPrices[div.value].standard.price" />
          <unit-price
            class="grey--text text--darken-1"
            :value="unitPrices[div.value].standard.overtime"
            as-overtime
          />
        </td>
        <td style="text-align: center">
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
