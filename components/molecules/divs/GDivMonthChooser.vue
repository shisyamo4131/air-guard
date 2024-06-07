<script>
import GIconNext from '~/components/atoms/icons/GIconNext.vue'
import GIconPrev from '~/components/atoms/icons/GIconPrev.vue'
/**
 * ### GDivMonthChooser
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GIconPrev, GIconNext },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
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
    computedValue: {
      get() {
        return this.internalValue
      },
      set(v) {
        this.internalValue = v
        this.$emit('input', v)
      },
    },
    month() {
      return this.$dayjs(this.internalValue).format('YYYY-MM')
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    value: {
      handler(newVal, oldVal) {
        if (!newVal || newVal === oldVal) return
        this.internalValue = newVal
      },
      immediate: true,
    },
  },
}
</script>

<template>
  <div class="d-flex align-center" style="column-gap: 4px">
    <v-btn
      color="primary"
      small
      outlined
      @click="computedValue = $dayjs().format('YYYY-MM-DD')"
      >今月</v-btn
    >
    <v-btn icon @click="$emit('click:prev')"><g-icon-prev /></v-btn>
    <span>{{ month }}</span>
    <v-btn icon @click="$emit('click:next')"><g-icon-next /></v-btn>
  </div>
</template>

<style></style>
