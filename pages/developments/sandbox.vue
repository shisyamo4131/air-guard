<template>
  <v-container>
    <v-btn @click="test">aaa</v-btn>
    {{ value }}
  </v-container>
</template>

<script>
import WorkRegulation from '~/models/WorkRegulation'
export default {
  data() {
    return {
      value: null,
    }
  },
  methods: {
    async test() {
      this.value = await WorkRegulation.getDefaultAttendanceInRange(
        'D0SHjxMgEJh14lPl53Jc',
        { from: '2024-10-01', to: '2024-10-31' }
      )
    },
  },
}
</script>

<style></style>
