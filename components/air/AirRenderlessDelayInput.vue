<script>
/**
 * INPUT コンポーネントに入力された値を、指定された遅延時間を待ってから返す
 * レンダーレスコンポーネントです。
 *
 * - 入力された値が false と判断される場合は遅延を行わずに即時反映します。
 *
 * @author shisyamo4131
 * @refact 2025-02-05
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * 検索文字列として入力された値を lazy-value イベントで emit させるまでの
     * 遅延時間（ミリ秒）です。
     */
    delay: { type: [String, Number], default: 500, required: false },

    /**
     * 入力の値です。
     */
    value: { type: undefined, default: undefined, required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      // コンポーネント内部で管理する入力の値です。
      internalValue: null,

      // 遅延管理用タイマーIDです。
      timerId: null,
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * 指定された遅延時間を待ってから、入力された値を data.lazy-value にセットします。
     */
    internalValue(v) {
      clearTimeout(this.timerId)
      const delay = v ? Number(this.delay) : 0
      this.timerId = setTimeout(() => {
        this.$emit('input', v)
      }, delay)
    },

    /**
     * props.value を監視し、値が更新されたら data.internalValue に同期します。
     */
    value: {
      handler(v) {
        this.internalValue = v
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * RENDER
   ***************************************************************************/
  render(h) {
    if (this.$scopedSlots.default) {
      return this.$scopedSlots.default({
        attrs: {
          value: this.internalValue,
        },
        on: {
          input: ($event) => (this.internalValue = $event),
        },
      })
    }

    // eslint-disable-next-line no-console
    console.warn('[AirRenderlessDelayInput] No default slot provided.')
    return null // スロットが提供されていない場合、何もレンダリングしない
  },
}
</script>

<style></style>
