<script>
/**
 * ### GChipWorkShift
 * 勤務区分を表すChipコンポーネントです。
 *
 * @component
 * @example
 * <GChipWorkShift
 *   :workShift="workShift"
 * />
 *
 * @props {String} workShift - workShiftを表す文字列
 *
 * @author shisyamo4131
 * @create 2024-06-18
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    workShift: {
      type: String,
      validator: (v) => ['day', 'night'].includes(v),
      required: true,
    },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    color() {
      if (this.workShift === 'day') {
        return `blue white--text`
      } else {
        return `red white--text`
      }
    },
    icon() {
      if (this.workShift === 'day') {
        return 'weather-sunny'
      } else {
        return 'weather-night'
      }
    },
  },
}
</script>

<template>
  <v-chip v-bind="$attrs" :color="color" v-on="$listeners"
    ><v-icon left>{{ `mdi-${icon}` }}</v-icon
    >{{ $WORK_SHIFT[value] }}</v-chip
  >
</template>

<style></style>
