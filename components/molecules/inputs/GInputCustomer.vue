<script>
/**
 * 取引先情報入力コンポーネントです。
 * @author shisyamo4131
 * @refact 2025-01-13
 */
import GTextField from '../../atoms/inputs/GTextField.vue'
import GSelect from '../../atoms/inputs/GSelect.vue'
import GNumeric from '../../atoms/inputs/GNumeric.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GTextFieldZipcode from '~/components/atoms/inputs/GTextFieldZipcode.vue'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
import { vueProps } from '~/models/propsDefinition/Customer'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GSelect,
    GNumeric,
    GTextarea,
    GSwitch,
    GTextFieldZipcode,
  },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeReceiver],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: vueProps,

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onChangedName1(val) {
      if (!val) return val
      // '株式会社'と'有限会社'を取り除く
      let result = val.replace(/株式会社|有限会社/g, '')
      // 前後の全角・半角スペースを取り除く
      result = result
        .trim()
        .replace(/^\s+|\s+$/g, '')
        .replace(/^[\u3000]+|[\u3000]+$/g, '')
      this.$emit('update:abbr', result)
    },
  },
}
</script>

<template>
  <div>
    <g-text-field
      :value="name1"
      label="取引先名1"
      required
      @input="$emit('update:name1', $event)"
      @change="onChangedName1"
    />
    <g-text-field
      :value="name2"
      label="取引先名2"
      @input="$emit('update:name2', $event)"
    />
    <g-text-field
      :value="abbr"
      label="略称"
      required
      hint="検索に使用されます"
      ignore-surrogate-pair
      @input="$emit('update:abbr', $event)"
    />
    <g-text-field
      :value="abbrKana"
      label="略称カナ"
      required
      hint="検索に使用されます"
      ignore-surrogate-pair
      input-type="katakana"
      @input="$emit('update:abbrKana', $event)"
    />
    <g-text-field-zipcode
      :value="zipcode"
      @input="$emit('update:zipcode', $event)"
      @loaded="$emit('update:address1', $event.full)"
    />
    <g-text-field
      :value="address1"
      label="住所"
      required
      @input="$emit('update:address1', $event)"
    />
    <g-text-field
      :value="address2"
      label="建物名・階数"
      @input="$emit('update:address2', $event)"
    />
    <v-row dense>
      <v-col cols="12" sm="6">
        <g-text-field
          :value="tel"
          label="電話番号"
          input-type="tel"
          @input="$emit('update:tel', $event)"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <g-text-field
          :value="fax"
          label="FAX番号"
          input-type="tel"
          @input="$emit('update:fax', $event)"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12" sm="4">
        <g-select
          :value="deadline"
          label="締日"
          :disabled="editMode !== CREATE"
          :items="$DEADLINE_ARRAY"
          required
          @input="$emit('update:deadline', $event)"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <g-numeric
          :value="depositMonth"
          class="right-input"
          label="入金月"
          :disabled="editMode !== CREATE"
          suffix="ヶ月後"
          required
          @input="$emit('update:depositMonth', $event)"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <g-select
          :value="depositDate"
          label="入金日"
          :disabled="editMode !== CREATE"
          :items="$DEADLINE_ARRAY"
          required
          @input="$emit('update:depositDate', $event)"
        />
      </v-col>
      <v-col cols="12">
        <g-switch
          :input-value="isInternal"
          label="自社情報である"
          @change="$emit('update:isInternal', $event)"
        />
      </v-col>
    </v-row>
    <g-textarea
      :value="remarks"
      label="備考"
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
