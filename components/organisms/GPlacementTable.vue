<template>
  <g-data-table-placements
    :start-at="startAt"
    :height="height"
    :items.sync="items"
    draggable-handle=".handle"
  >
    <template #site="{ siteId, workShift }">
      <g-placement-site-card :site-id="siteId" :work-shift="workShift" />
    </template>
    <template #workShift="{ workShift }">
      <g-chip-work-shift :value="workShift" />
    </template>
    <template #cell="props">
      <draggable
        :value="props.workers"
        :group="{ name: 'employees', put: enablePut(props.workers) }"
        class="pa-1 fill-height"
        @input="onInputWorkers({ ...props, workers: $event })"
        @start="$emit('selected', props.workers[$event.oldIndex])"
        @end="$emit('selected', null)"
      >
        <g-placement-employee-chip
          v-for="(worker, index) of props.workers"
          :key="index"
          class="ma-1"
          v-bind="{ ...props, worker }"
        />
      </draggable>
    </template>
  </g-data-table-placements>
</template>

<script>
import draggable from 'vuedraggable'
import GChipWorkShift from '../molecules/chips/GChipWorkShift.vue'
import GDataTablePlacements from '../molecules/tables/GDataTablePlacements.vue'
import GPlacementEmployeeChip from './GPlacementEmployeeChip.vue'
import GPlacementSiteCard from './GPlacementSiteCard.vue'
export default {
  components: {
    draggable,
    GDataTablePlacements,
    GPlacementEmployeeChip,
    GPlacementSiteCard,
    GChipWorkShift,
  },
  props: {
    height: { type: [Number, String], default: undefined, required: false },
    startAt: { type: String, required: true },
    selectedEmployee: {
      type: [String, Object],
      default: null,
      required: false,
    },
  },
  data() {
    return {
      count: 14,
    }
  },
  computed: {
    dates() {
      if (!this.startAt) return []
      return [...Array(this.count)].map((_, i) => {
        return this.$dayjs(this.startAt).add(i, 'day').format('YYYY-MM-DD')
      })
    },
    items: {
      get() {
        const index = this.$store.getters['placements/index']
        const result = index.map(({ siteId, workShift }) => {
          const detail = this.dates.reduce((sum, date) => {
            const params = { date, siteId, workShift }
            sum[date] = this.$store.getters['placements/detail'](params)
            return sum
          }, {})
          return { siteId, workShift, ...detail }
        })
        return result
      },
      set(v) {
        const result = v.map(({ siteId, workShift }) => {
          return { siteId, workShift }
        })
        this.$store.dispatch('placements/updateIndex', result)
      },
    },
  },
  watch: {
    startAt: {
      handler(v) {
        this.$store.dispatch('placements/unsubscribe')
        if (!v) return
        const from = this.dates[0]
        const to = this.dates[this.dates.length - 1]
        this.$store.dispatch('placements/subscribe', { from, to })
      },
      immediate: true,
    },
  },
  destroyed() {
    this.$store.dispatch('placements/unsubscribe')
  },
  methods: {
    onInputWorkers(item) {
      this.$store.dispatch('placements/updatePlacementDetail', item)
    },
    enablePut(workers) {
      if (!this.selectedEmployee) return true
      return !workers.includes(this.selectedEmployee)
    },
  },
}
</script>

<style></style>
