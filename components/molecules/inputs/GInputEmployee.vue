<script>
/**
 * Employee用Inputコンポーネントです。
 * @author shisyamo4131
 * @refact 2025-01-20
 */
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GTextFieldZipcode from '~/components/atoms/inputs/GTextFieldZipcode.vue'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
import { vueProps } from '~/models/propsDefinition/Employee'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GTextarea,
    GSwitch,
    GSelect,
    GComboboxDate,
    GTextFieldZipcode,
  },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeReceiver],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    ...vueProps,
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * `lastName`または`firstName`のchangeイベントで呼び出されます。
     * `lastName`と`firstName`を結合して最初の5文字を生成し、`abbr`にセットします。
     */
    refreshAbbr() {
      const combined = `${this.lastName}${this.firstName}`
      const sliced = combined.slice(0, 5)
      this.$emit('update:abbr', sliced)
    },
  },
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
    <v-row dense>
      <v-col cols="12" md="6">
        <g-text-field
          :value="lastName"
          label="氏"
          required
          @input="$emit('update:lastName', $event)"
          @change="refreshAbbr"
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-text-field
          :value="firstName"
          label="名"
          @input="$emit('update:firstName', $event)"
          @change="refreshAbbr"
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-text-field
          :value="lastNameKana"
          label="氏カナ"
          required
          hint="検索に使用されます"
          ignore-surrogate-pair
          input-type="katakana"
          @input="$emit('update:lastNameKana', $event)"
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-text-field
          :value="firstNameKana"
          label="名カナ"
          required
          hint="検索に使用されます"
          ignore-surrogate-pair
          input-type="katakana"
          @input="$emit('update:firstNameKana', $event)"
        />
      </v-col>
      <v-col cols="12" md="6">
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
      </v-col>
      <v-col cols="12" md="6">
        <g-text-field
          :value="abbrKana"
          label="略称カナ"
          required
          hint="検索に使用されます"
          ignore-surrogate-pair
          counter
          maxlength="5"
          input-type="katakana"
          @input="$emit('update:abbrKana', $event)"
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-combobox-date
          :value="hireDate"
          label="入社日"
          required
          @input="$emit('update:hireDate', $event)"
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-combobox-date
          :value="birth"
          label="生年月日"
          required
          @input="$emit('update:birth', $event)"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-radio-group
          :value="gender"
          class="mt-1 mb-2"
          row
          @change="$emit('update:gender', $event)"
        >
          <v-radio label="男性" value="male" />
          <v-radio label="女性" value="female" />
        </v-radio-group>
      </v-col>
      <v-col cols="12" md="6">
        <g-select
          :value="bloodType"
          label="血液型"
          :items="['A', 'B', 'O', 'AB', '-']"
          required
          @input="$emit('update:bloodType', $event)"
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-switch
          :value="isForeigner"
          class="mt-1"
          label="外国籍"
          @change="$emit('update:isForeigner', $event)"
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-text-field
          :value="nationality"
          label="国籍"
          :required="isForeigner"
          :disabled="!isForeigner"
          @input="$emit('update:nationality', $event)"
        />
      </v-col>
    </v-row>
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
    <g-select
      :value="contractType"
      label="雇用形態"
      required
      :items="$EMPLOYEE_CONTRACT_TYPE_ARRAY"
      @input="$emit('update:contractType', $event)"
    />
    <g-text-field
      :value="designation"
      label="役職"
      required
      counter
      maxlength="5"
      @input="$emit('update:designation', $event)"
    />
    <g-textarea
      :value="remarks"
      label="備考"
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
