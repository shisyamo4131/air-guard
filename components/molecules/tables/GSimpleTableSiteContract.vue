<script>
/**
 * ### GSimpleTableSiteContract
 *
 * 単一の現場取極め情報を表示するSimpleTableコンポーネントです。
 *
 * - `SiteContract`インスタンスを受け取り、SimpleTableコンポーネントで情報を表示します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-09-18 - 初版作成
 */
import SiteContract from '~/models/SiteContract'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    /**
     * 単価情報を表示するためのインラインコンポーネント
     * - `props.value`で単価（数値）を受け取ります。
     * - 受け取った値を桁区切りにし、divで出力します。
     * - `props.asOvertime`が true の場合、値が括弧で括られます。
     */
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
  props: {
    instance: {
      type: Object,
      required: true,
      validator: (instance) => instance instanceof SiteContract,
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * 曜日区分ごとの出力をループさせるための変数です。
       */
      dayDivs: [
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
      <tr v-for="(dayDiv, index) of dayDivs" :key="`dayDiv-${index}`">
        <!-- 曜日区分 -->
        <td style="text-align: center">{{ dayDiv.text }}</td>
        <!-- 通常単価 -->
        <td style="text-align: center">
          <unit-price
            :value="instance.unitPrices[dayDiv.value].standard.price"
          />
          <unit-price
            class="grey--text text--darken-1"
            :value="instance.unitPrices[dayDiv.value].standard.overtime"
            as-overtime
          />
        </td>
        <!-- 資格者単価 -->
        <td style="text-align: center">
          <unit-price
            :value="instance.unitPrices[dayDiv.value].qualified.price"
          />
          <unit-price
            class="grey--text text--darken-1"
            :value="instance.unitPrices[dayDiv.value].qualified.overtime"
            as-overtime
          />
        </td>
      </tr>
    </tbody>
  </v-simple-table>
</template>

<style></style>
