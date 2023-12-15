<template>
  <v-data-table
    class="placement-table"
    v-bind="$attrs"
    disable-sort
    fixed-header
    :headers="headers"
    hide-default-footer
    :items="items"
    :items-per-page="-1"
    v-on="$listeners"
  >
    <!-- day columns -->
    <template v-for="col of cols" #[`header.${col.date}`]>
      <v-checkbox
        :key="col.date"
        class="mt-0 d-inline-block"
        dense
        hide-details
        :input-value="isSelected(col.date)"
        @change="toggle(col.date)"
      >
        <template #label>
          <div class="text-caption font-weight-bold">
            {{ col.dateShort }}
          </div>
        </template>
      </v-checkbox>
    </template>
    <!-- body -->
    <template #body="props">
      <draggable
        :value="props.items"
        tag="tbody"
        :group="draggableGroup"
        :handle="draggableHandle"
        @input="$emit('update:items', $event)"
      >
        <tr v-for="(item, index) of props.items" :key="index">
          <td style="vertical-align: top">
            <slot name="site" v-bind="{ ...item }">
              {{ item.siteId }}
            </slot>
          </td>
          <td>
            <slot name="workShift" v-bind="{ ...item }">
              {{ item.workShift }}
            </slot>
          </td>
          <td v-for="col of cols" :key="col.date" style="vertical-align: top">
            <slot
              name="cell"
              v-bind="{
                docId: item[col.date]?.docId || undefined,
                date: col.date,
                siteId: item.siteId,
                workShift: item.workShift,
                workers: item[col.date]?.workers || [],
              }"
            >
              {{ item[col.date]?.docId || undefined }}
            </slot>
          </td>
        </tr>
      </draggable>
    </template>
  </v-data-table>
</template>

<script>
import draggable from 'vuedraggable'
export default {
  components: { draggable },
  model: { prop: 'items', event: 'input' },
  props: {
    dayWidth: { type: [String, Number], default: 180, required: false },
    draggableGroup: {
      type: Object,
      default: () => {
        return {
          name: 'site',
        }
      },
      required: false,
    },
    draggableHandle: { type: String, default: undefined, required: false },
    items: { type: Array, default: () => [], required: false },
    selectedDate: { type: String, default: undefined, required: false },
  },
  data() {
    return {
      lazyDate: undefined,
    }
  },
  computed: {
    headers() {
      const result = [
        { text: '現場', value: 'siteId', width: 276 },
        { text: '区分', value: 'workShift', width: 120 },
      ]
      this.cols.forEach((col) => {
        result.push({
          text: col.dateShort,
          value: `${col.date}`,
          width: this.dayWidth,
        })
      })
      return result
    },
    /**
     * Returns the column of dates to be displayed in the table.
     * The dates to be displayed are automatically calculated from props.items.
     */
    cols() {
      if (!this.items.length) return []
      const result = []
      const dates = Object.keys(this.items[0]).filter((key) => {
        return key !== 'siteId' && key !== 'workShift'
      })
      dates.forEach((date) => {
        const dayjs = this.$dayjs(date)
        result.push({
          date: dayjs.format('YYYY-MM-DD'),
          dateShort: dayjs.format('MM/DD(ddd)'),
          day: dayjs.format('d'),
        })
      })
      return result
    },
    internalSelectedDate: {
      get() {
        return this.lazyDate
      },
      set(v) {
        this.lazyDate = v
        this.$emit('update:selectedDate', v)
      },
    },
  },
  methods: {
    isSelected(date) {
      return this.internalSelectedDate === date
    },
    toggle(date) {
      if (this.internalSelectedDate === date) {
        this.internalSelectedDate = undefined
      } else {
        this.internalSelectedDate = date
      }
    },
  },
}
</script>

<style>
.placement-table th:nth-child(-n + 2),
.placement-table td:nth-child(-n + 2) {
  position: sticky;
  z-index: 3 !important;
  background: #ffffff;
}
.placement-table th:nth-child(1),
.placement-table td:nth-child(1) {
  left: 0;
}
.placement-table th:nth-child(2),
.placement-table td:nth-child(2) {
  left: 276px;
}
.placement-table tr:hover td:nth-child(-n + 2) {
  background: #eee;
}
</style>
