<script>
/**
 * [使用不可]
 * 年月選択コンポーネント
 * @author shisyamo
 */
import GDialogMonthPicker from '../dialogs/GDialogMonthPicker.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDialogMonthPicker, GTextField },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    options: { type: Object, default: () => ({}), required: false },
  },
}
</script>

<template>
  <g-dialog-month-picker v-bind="$attrs" v-on="$listeners">
    <template #activator="{ attrs, on }">
      <slot name="activator" v-bind="{ attrs, on }">
        <g-text-field
          v-bind="{ ...options, ...attrs }"
          class="center-input"
          style="max-width: 120px"
          label="年月"
          v-on="on"
        />
      </slot>
    </template>
  </g-dialog-month-picker>
</template>

<style></style>
