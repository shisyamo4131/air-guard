<script>
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
export default {
  components: { GNumeric },
  props: {
    normal: { type: Number, default: null, required: false },
    half: { type: Number, default: null, required: false },
    cancel: { type: Number, default: null, required: false },
  },
}
</script>

<template>
  <div>
    <v-row>
      <v-col cols="12" md="4">
        <g-numeric
          class="right-input"
          label="通常"
          :value="normal"
          suffix="名"
          @input="$emit('update:normal', $event)"
        />
      </v-col>
      <v-col cols="12" md="4">
        <g-numeric
          class="right-input"
          label="半勤"
          :value="half"
          suffix="名"
          @input="$emit('update:half', $event)"
        />
      </v-col>
      <v-col cols="12" md="4">
        <g-numeric
          class="right-input"
          label="中止"
          :value="cancel"
          suffix="名"
          @input="$emit('update:cancel', $event)"
        />
      </v-col>
    </v-row>
  </div>
</template>

<style></style>
