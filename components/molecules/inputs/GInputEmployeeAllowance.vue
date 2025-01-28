<script>
/**
 * 従業員支給手当情報入力コンポーネント
 * @author shisyamo4131
 * @refact 2025-01-28
 */
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GAutocomplete from '~/components/atoms/inputs/GAutocomplete.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GNumeric, GAutocomplete },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    docId: { type: String, default: '', required: false },
    amount: { type: Number, default: null, required: false },
  },
}
</script>

<template>
  <div>
    <g-autocomplete
      :value="docId"
      label="手当"
      :items="$store.getters['allowances/items']"
      item-value="docId"
      item-text="name"
      required
      @input="$emit('update:docId', $event)"
    />
    <g-numeric
      :value="amount"
      class="right-input"
      label="金額"
      required
      suffix="円"
      @input="$emit('update:amount', $event)"
    />
  </div>
</template>

<style></style>
