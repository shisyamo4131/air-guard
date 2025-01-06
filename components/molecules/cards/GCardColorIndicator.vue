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
      default: () => [
        'primary',
        'secondary',
        'info',
        'warning',
        'success',
        'highlight',
      ],
      required: false,
    },

    /**
     * 指定された値（数値）をベースにしてラベル冒頭の色を計算します。
     */
    index: { type: [String, Number], default: 0, required: false },

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
    itemText: { type: String, default: 'text', required: false },

    /**
     * ラベルの冒頭に付与されるアイコンです。
     */
    prefixIcon: { type: String, default: 'mdi-square', required: false },
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
      const index = parseInt(this.index, 10)
      const validIndex = isNaN(index) ? 0 : index // 無効な値はデフォルト値 0 に
      const colorIndex = validIndex % this.colors.length
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
        <v-icon :color="dotColor" x-small>
          {{ prefixIcon }}
        </v-icon>
        {{ `${label}` }}
      </h4>
      <div class="px-2">
        <slot name="default" v-bind="{ item }">
          <span style="white-space: pre-line">{{ text }}</span>
        </slot>
      </div>
    </v-card-text>
  </v-card>
</template>

<style></style>
