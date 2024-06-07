<template>
  <g-chip-employee
    :doc-id="worker"
    :errors="errors"
    close
    :continuous="isContinuos"
    @click:close="onClickClose"
  />
</template>

<script>
import GChipEmployee from '../molecules/chips/GChipEmployee.vue'
export default {
  components: { GChipEmployee },
  props: {
    worker: { type: String, required: true },
    docId: { type: String, required: true },
    date: { type: String, required: true },
    siteId: { type: String, required: true },
    workShift: { type: String, required: true },
    workers: { type: Array, required: true },
  },
  computed: {
    errors() {
      const result = []
      if (this.isDuplicated) result.push('配置が重複しています。')
      if (this.hasLeaveApplication) result.push('休暇申請を受理しています。')
      return result
    },
    isDuplicated() {
      return this.$store.getters['placements/isDuplicated']({ ...this.$props })
    },
    isContinuos() {
      return this.$store.getters['placements/isContinuos']({ ...this.$props })
    },
    hasLeaveApplication() {
      return this.$store.getters['placements/hasLeaveApplication']({
        ...this.$props,
      })
    },
  },
  methods: {
    onClickClose() {
      const workers = this.workers.filter((docId) => docId !== this.worker)
      this.$store.dispatch('placements/updatePlacementDetail', {
        ...this.$props,
        workers,
      })
    },
  },
}
</script>

<style></style>
