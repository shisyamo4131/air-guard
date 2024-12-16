<script>
/**
 * 小さな情報を表示するためのカードコンポーネントです。
 * ラベル部、テキスト部から成り、オブジェクトとして与えられた情報を表示します。
 * ラベル部には指定したプレフィックスを付けることができ、インデックスで指定した
 * 色が着色されます。
 * @author shisyamo4131
 */
export default {
  /****************************************************************************
   * PROPS
   ****************************************************************************/
  props: {
    /**
     * ラベル冒頭の記号に使う色を配列で指定します。
     */
    colors: {
      type: Array,
      default: () => ['#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#F1C40F'],
      required: false,
    },

    /**
     * 指定された値（数値）をベースにしてラベル冒頭の色を計算します。
     */
    colorIndex: { type: Number, default: 0, required: false },

    /**
     * ラベルの冒頭に付与される記号です。
     */
    labelPrefix: { type: String, default: '■', required: false },

    /**
     * 出力するラベル、テキストをプロパティとして持つオブジェクトを指定します。
     */
    item: { type: Object, default: null, required: false },

    /**
     * item オブジェクトのラベルプロパティ名です。既定値は `label` です。
     */
    itemLabel: { type: String, default: 'label', required: false },

    /**
     * item オブジェクトのテキストプロパティ名です。既定値は `text` です。
     */
    itemText: { type: String, default: 'label', required: false },
  },

  /****************************************************************************
   * COMPUTED
   ****************************************************************************/
  computed: {
    /**
     * ラベル冒頭の色を返します。
     */
    dotColor() {
      // indexをカラーパレットの範囲に合わせる（ループさせる）
      const colorIndex = this.colorIndex % this.colors.length
      return this.colors[colorIndex]
    },

    /**
     * ラベルを返します。
     */
    label() {
      return this.item?.[this.itemLabel] || 'N/A'
    },

    /**
     * テキストを返します。
     */
    text() {
      return this.item?.[this.itemText] || 'N/A'
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-text class="pa-2">
      <h4>
        <span :style="{ color: dotColor }">{{ labelPrefix }}</span>
        {{ `${label}` }}
      </h4>
      <div class="px-2">
        <slot name="default" v-bind="{ item }">
          {{ text }}
        </slot>
      </div>
    </v-card-text>
  </v-card>
</template>

<style></style>
