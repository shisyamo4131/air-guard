<script>
/**
 * ### GDivMonthChooser
 * 月の選択を行うコンポーネントです。
 *
 * @component
 * @example
 * <GDivMonthChooser v-model="selectedMonth" />
 *
 * @props {String} value - v-modelバインディング用の月データ
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-06-21 - 初版作成
 */
import GIconNext from '~/components/atoms/icons/GIconNext.vue'
import GIconPrev from '~/components/atoms/icons/GIconPrev.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GIconPrev, GIconNext },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    disableNext: { type: Boolean, default: false, required: false },
    disablePrev: { type: Boolean, default: false, required: false },
    hideCurrentMonth: { type: Boolean, default: false, required: false },
    value: { type: String, default: undefined, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      internalValue: this.$dayjs().format('YYYY-MM-DD'),
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * v-modelバインディング用の計算プロパティ
     */
    computedValue: {
      get() {
        return this.internalValue
      },
      set(v) {
        this.internalValue = v
        this.$emit('input', v)
      },
    },
    /**
     * 月を表示するための計算プロパティ
     */
    month() {
      return this.$dayjs(this.internalValue).format('YYYY-MM')
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * props.valueの値を監視し、変更があればinternalValueに反映します。
     */
    value: {
      handler(v) {
        this.internalValue = v
      },
      immediate: true,
    },
  },
}
</script>

<template>
  <div class="d-flex align-center" style="column-gap: 4px">
    <v-btn
      v-if="!hideCurrentMonth"
      color="primary"
      small
      outlined
      @click="computedValue = $dayjs().format('YYYY-MM-DD')"
    >
      今月
    </v-btn>
    <v-btn :disabled="disablePrev" icon @click="$emit('click:prev')">
      <g-icon-prev />
    </v-btn>
    <span>{{ month }}</span>
    <v-btn :disabled="disableNext" icon @click="$emit('click:next')">
      <g-icon-next />
    </v-btn>
  </div>
</template>

<style></style>
