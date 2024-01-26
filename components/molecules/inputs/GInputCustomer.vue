<script>
import ATextField from '~/components/atoms/inputs/ATextField.vue'
import { props } from '~/models/Customer'

/**
 * ## GInputCustomer
 * Customer用INPUT
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { ATextField },
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
    <a-text-field
      :value="name1"
      label="取引先名1"
      required
      @input="$emit('update:name1', $event)"
    />
    <a-text-field
      :value="name2"
      label="取引先名2"
      @input="$emit('update:name2', $event)"
    />
    <a-text-field
      :value="abbr"
      label="略称"
      required
      @input="$emit('update:abbr', $event)"
    />
    <a-text-field
      :value="abbrKana"
      label="略称カナ"
      required
      input-type="katakana"
      @input="$emit('update:abbrKana', $event)"
    />
    <a-text-field
      :value="address"
      label="住所"
      required
      @input="$emit('update:address', $event)"
    />
  </div>
</template>

<style></style>
