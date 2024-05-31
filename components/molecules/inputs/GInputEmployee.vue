<script>
import GDate from '~/components/atoms/inputs/GDate.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
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
  components: { GTextField, GTextarea, ARenderlessZipcode, GSwitch, GDate },
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
    <g-text-field
      :value="lastName"
      label="氏"
      required
      @input="$emit('update:lastName', $event)"
    />
    <g-text-field
      :value="firstName"
      label="名"
      @input="$emit('update:firstName', $event)"
    />
    <g-text-field
      :value="lastNameKana"
      label="氏カナ"
      required
      hint="検索に使用されます"
      ignore-surrogate-pair
      input-type="katakana"
      @input="$emit('update:lastNameKana', $event)"
    />
    <g-text-field
      :value="firstNameKana"
      label="名カナ"
      required
      hint="検索に使用されます"
      ignore-surrogate-pair
      input-type="katakana"
      @input="$emit('update:firstNameKana', $event)"
    />
    <g-text-field
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
        <g-text-field v-bind="attrs" label="郵便番号" v-on="on" />
      </template>
    </a-renderless-zipcode>
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
    <g-text-field
      :value="tel"
      label="電話番号"
      input-type="tel"
      @input="$emit('update:tel', $event)"
    />
    <g-text-field
      :value="mobile"
      label="携帯番号"
      input-type="tel"
      @input="$emit('update:mobile', $event)"
    />
    <g-date
      :value="hireDate"
      label="入社日"
      required
      @input="$emit('update:hireDate', $event)"
    />
    <g-switch
      :input-value="isForeigner"
      label="外国籍"
      @change="$emit('update:isForeigner', $event)"
    />
    <v-expand-transition>
      <g-text-field
        v-show="isForeigner"
        :value="nationality"
        label="国籍"
        :required="isForeigner"
        @input="$emit('update:nationality', $event)"
      />
    </v-expand-transition>
    <g-date
      :value="leaveDate"
      label="退職日"
      @input="$emit('update:leaveDate', $event)"
    />
    <v-expand-transition>
      <g-text-field
        v-show="leaveDate"
        :value="leaveReason"
        label="退職事由"
        :required="!!leaveDate"
        @input="$emit('update:leaveReason', $event)"
      />
    </v-expand-transition>
    <g-textarea
      :value="remarks"
      label="備考"
      hide-details
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
