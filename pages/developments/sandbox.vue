<template>
  <v-container>
    <g-date-picker-multiple v-model="model.date" />
    <v-btn @click="regist">regist</v-btn>
  </v-container>
</template>

<script>
import GDatePickerMultiple from '~/components/atoms/pickers/GDatePickerMultiple.vue'
export default {
  components: { GDatePickerMultiple },
  data() {
    return {
      model: this.$SiteOperationScheduleBulk({
        siteId: 'KFLWoTljBjmlDbGi992A',
        workShift: 'day',
      }),
    }
  },
  methods: {
    async regist() {
      await this.model.create()
    },
  },
}
</script>

<style></style>
