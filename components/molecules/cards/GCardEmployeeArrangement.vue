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
    employeeId: { type: String, required: true },
    arrangement: { type: Object, required: true },
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
        <h4>{{ employee.abbr }}</h4>
        <v-spacer />
        <v-icon left small>mdi-pencil</v-icon>
        <v-icon small @click="$emit('click:remove', employeeId)">
          mdi-close
        </v-icon>
      </div>
      <div class="d-flex align-center">
        <v-icon left small>mdi-clock-outline</v-icon>
        <div>{{ arrangement?.startTime || null }}</div>
        <div>-</div>
        <div>{{ arrangement?.endTime || null }}</div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style></style>
