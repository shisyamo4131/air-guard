<script>
/**
 * 単価情報入力用コンポーネント
 * @author shisyamo4131
 * @refact 2025-01-27
 */
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GNumeric },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    normal: { type: Number, default: null, required: false },
    half: { type: Number, default: null, required: false },
    cancel: { type: Number, default: null, required: false },
    overtime: { type: Number, default: null, required: false },
  },
}
</script>

<template>
  <div>
    <v-row>
      <v-col cols="12" md="6">
        <g-numeric
          class="right-input"
          label="通常"
          :value="normal"
          suffix="円"
          @input="$emit('update:normal', $event)"
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-numeric
          class="right-input"
          label="半勤"
          :value="half"
          suffix="円"
          @input="$emit('update:half', $event)"
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-numeric
          class="right-input"
          label="中止"
          :value="cancel"
          suffix="円"
          @input="$emit('update:cancel', $event)"
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-numeric
          class="right-input"
          label="残業単価"
          :value="overtime"
          suffix="円"
          @input="$emit('update:overtime', $event)"
        />
      </v-col>
    </v-row>
  </div>
</template>

<style></style>
