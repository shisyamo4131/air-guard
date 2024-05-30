<script>
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import { props } from '~/models/OperationResult'
import GDate from '~/components/atoms/inputs/GDate.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'

/**
 * ## GInputOperationResult
 * OperationResult用INPUT
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextField, GTextarea, GDate, GNumeric },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props],
}
</script>

<template>
  <div>
    <g-text-field
      :value="code"
      label="CODE"
      disabled
      @input="$emit('update:code', $event)"
    />
    <g-date :value="date" label="日付" @input="$emit('update:date', $event)" />
    <g-numeric
      :value="sales"
      label="売上"
      required
      @input="$emit('update:sales', $event)"
    />
    <g-textarea
      :value="remarks"
      label="備考"
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
