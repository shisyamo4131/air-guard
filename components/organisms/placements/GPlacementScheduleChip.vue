<script>
import { Placement } from '~/models/Placement'
import SiteOperationSchedule from '~/models/SiteOperationSchedule'

export default {
  props: {
    placement: {
      type: Object,
      validator: (instance) => instance instanceof Placement,
      required: true,
    },
    siteOperationSchedule: {
      type: Object,
      validator: (instance) => instance instanceof SiteOperationSchedule,
      required: true,
    },
  },

  computed: {
    /**
     * 配置された従業員IDのリストを返します
     */
    employeeOrder() {
      return this.placement?.data?.employeeOrder || []
    },

    /**
     * 配置された外注先IDのリストを返します
     */
    outsourcerOrder() {
      return this.placement?.data?.outsourcerOrder || []
    },

    isClosed() {
      return this.siteOperationSchedule.isClosed ?? false
    },

    /**
     * 配置した人員数が必要人員数を満たしているかを返します
     * - 満たしていない場合はtrue、満たしている場合はfalseを返します
     */
    isLackedWorkers() {
      const required = this.siteOperationSchedule?.requiredWorkers || 0
      return required > this.placedAmount
    },

    /**
     * 配置された総人数 (従業員 + 外注先) を返します
     */
    placedAmount() {
      return this.employeeOrder.length + this.outsourcerOrder.length
    },

    qualification() {
      return this.siteOperationSchedule.qualification ?? false
    },

    requiredWorkers() {
      return this.siteOperationSchedule.requiredWorkers ?? '-'
    },
  },
}
</script>

<template>
  <v-chip
    v-bind="$attrs"
    :color="isClosed ? 'lime darken-4' : isLackedWorkers ? 'error' : 'info'"
    dark
    v-on="$listeners"
  >
    <v-icon v-if="!isClosed && qualification" small left> mdi-star </v-icon>
    <span v-if="!isClosed"
      >{{ placedAmount }}/{{ requiredWorkers || '-' }}</span
    >
    <span v-else>休工</span>
    <v-icon right small>mdi-calendar</v-icon>
  </v-chip>
</template>

<style></style>
