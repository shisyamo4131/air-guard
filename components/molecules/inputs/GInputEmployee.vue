<script>
import ATextarea from '~/components/atoms/inputs/ATextarea.vue'
import ATextField from '~/components/atoms/inputs/ATextField.vue'
import ARenderlessZipcode from '~/components/atoms/renderless/ARenderlessZipcode.vue'
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
  components: { ATextField, ATextarea, ARenderlessZipcode },
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
    <v-radio-group
      :value="gender"
      :row="$vuetify.breakpoint.mdAndUp"
      @change="$emit('update:gender', $event)"
    >
      <v-radio label="男性" value="male" />
      <v-radio label="女性" value="female" />
    </v-radio-group>
    <a-renderless-zipcode
      :value="zipcode"
      @input="$emit('update:zipcode', $event)"
      @loaded="$emit('update:address1', $event.full)"
    >
      <template #default="{ attrs, on }">
        <a-text-field v-bind="attrs" label="郵便番号" v-on="on" />
      </template>
    </a-renderless-zipcode>
    <a-text-field
      :value="address1"
      label="住所"
      required
      @input="$emit('update:address1', $event)"
    />
    <a-text-field
      :value="address2"
      label="建物名・階数"
      @input="$emit('update:address2', $event)"
    />
    <a-text-field
      :value="tel"
      label="電話番号"
      input-type="tel"
      @input="$emit('update:tel', $event)"
    />
    <a-text-field
      :value="mobile"
      label="携帯番号"
      input-type="tel"
      @input="$emit('update:mobile', $event)"
    />
    <a-textarea
      :value="remarks"
      label="備考"
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
