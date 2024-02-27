<script>
import ATextarea from '~/components/atoms/inputs/ATextarea.vue'
import ATextField from '~/components/atoms/inputs/ATextField.vue'
import { props } from '~/models/Employee'

/**
 * ## InputEmployee
 * Employee用INPUT
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { ATextField, ATextarea },
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
      :value="lastName"
      label="氏"
      required
      @input="$emit('update:lastName', $event)"
    />
    <a-text-field
      :value="firstName"
      label="名"
      @input="$emit('update:firstName', $event)"
    />
    <a-text-field
      :value="lastNameKana"
      label="氏カナ"
      required
      hint="検索に使用されます"
      ignore-surrogate-pair
      input-type="katakana"
      @input="$emit('update:lastNameKana', $event)"
    />
    <a-text-field
      :value="firstNameKana"
      label="名カナ"
      required
      hint="検索に使用されます"
      ignore-surrogate-pair
      input-type="katakana"
      @input="$emit('update:firstNameKana', $event)"
    />
    <a-text-field
      :value="abbr"
      label="略称"
      required
      hint="検索に使用されます"
      ignore-surrogate-pair
      counter
      maxlength="5"
      @input="$emit('update:abbr', $event)"
    />
    <a-textarea
      :value="remarks"
      label="備考"
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
