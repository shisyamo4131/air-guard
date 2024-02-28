<script>
import GAutocompleteSite from './GAutocompleteSite.vue'
import ATextarea from '~/components/atoms/inputs/ATextarea.vue'
import ATextField from '~/components/atoms/inputs/ATextField.vue'
import { props } from '~/models/OperationResult'
import ADate from '~/components/atoms/inputs/ADate.vue'
import ANumeric from '~/components/atoms/inputs/ANumeric.vue'

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
  components: { ATextField, ATextarea, GAutocompleteSite, ADate, ANumeric },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props],
}
</script>

<template>
  <div>
    <a-text-field
      :value="code"
      label="CODE"
      disabled
      @input="$emit('update:code', $event)"
    />
    <a-date :value="date" label="日付" @input="$emit('update:date', $event)" />
    <g-autocomplete-site
      :value="site"
      label="現場"
      required
      return-object
      @input="$emit('update:site', $event)"
    />
    <a-numeric
      :value="sales"
      label="売上"
      required
      @input="$emit('update:sales', $event)"
    />
    <a-textarea
      :value="remarks"
      label="備考"
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
