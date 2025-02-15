<template>
  <v-container>
    <air-array-manager
      :dialog-props="{ maxWidth: 600 }"
      :handle-create="async (item) => await item.create()"
      :schema="instance"
    >
      <template #default="{ toRegist }">
        <v-btn @click="toRegist">click</v-btn>
      </template>
      <template #inputs="{ attrs, on }">
        <g-input-work-regulation v-bind="attrs" v-on="on" />
      </template>
    </air-array-manager>
  </v-container>
</template>

<script>
import AirArrayManager from '~/components/air/AirArrayManager.vue'
import GInputWorkRegulation from '~/components/molecules/inputs/GInputWorkRegulation.vue'
import WorkRegulation from '~/models/WorkRegulation'
export default {
  components: { GInputWorkRegulation, AirArrayManager },
  data() {
    return {
      instance: new WorkRegulation(),
    }
  },
}
</script>

<style></style>
