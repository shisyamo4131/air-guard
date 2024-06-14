<script>
/***
 * ### GRadioGroupWorkShift
 * @author shisyamo4131
 * @create 2024-06-14
 */
export default {
  model: { prop: 'value', event: 'change' },
}
</script>

<template>
  <v-radio-group v-bind="$attrs" v-on="$listeners">
    <v-radio value="day" color="blue" label="日勤" />
    <v-radio value="night" color="red" label="夜勤" />
  </v-radio-group>
</template>

<style></style>
