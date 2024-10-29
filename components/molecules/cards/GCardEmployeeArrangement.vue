<script>
/**
 * ## GCardEmployeeArrangement
 *
 * - 配置管理で使用する従業員のカードです。
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * 当該従業員の配置情報
     */
    arrangement: { type: Object, required: true },
    /**
     * Card を省略表示にします。
     */
    ellipsis: { type: Boolean, default: false, required: false },
    /**
     * 対象の従業員ID
     */
    employeeId: { type: String, required: true },
    /**
     * true にすると従業員名の先頭に連勤アイコンを表示します。
     */
    showContinuous: { type: Boolean, default: false, required: false },
    /**
     * true にすると従業員名の先頭にエラーアイコンを表示します。
     */
    showError: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    employee() {
      return this.$store.getters['employees/get'](this.employeeId)
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-text class="pa-2">
      <div class="d-flex">
        <v-icon v-if="showError" left small color="error">
          mdi-alert-circle
        </v-icon>
        <v-icon v-else-if="showContinuous" left small color="warning">
          mdi-star
        </v-icon>
        <h4>{{ employee.abbr }}</h4>
        <v-spacer />
        <v-icon left small>mdi-pencil</v-icon>
        <v-icon small @click="$emit('click:remove', employeeId)">
          mdi-close
        </v-icon>
      </div>
      <div v-show="!ellipsis">
        <div class="d-flex align-center">
          <v-icon left small>mdi-clock-outline</v-icon>
          <div>{{ arrangement?.startTime || null }}</div>
          <div>-</div>
          <div>{{ arrangement?.endTime || null }}</div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style></style>
