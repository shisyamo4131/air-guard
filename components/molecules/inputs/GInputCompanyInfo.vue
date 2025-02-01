<script>
/**
 * 自社情報入力コンポーネント
 * @author shisyamo4131
 * @refact 2025-02-01
 */
import GTextField from '../../atoms/inputs/GTextField.vue'
import GTextFieldZipcode from '~/components/atoms/inputs/GTextFieldZipcode.vue'
import { vueProps } from '~/models/CompanyInfo'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextField, GTextFieldZipcode },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: vueProps,
}
</script>

<template>
  <div>
    <g-text-field
      :value="name1"
      label="会社名1"
      required
      @input="$emit('update:name1', $event)"
    />
    <g-text-field
      :value="name2"
      label="会社名2"
      @input="$emit('update:name2', $event)"
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
    <g-text-field
      :value="corporateNumber"
      label="法人番号"
      @input="$emit('update:corporateNumber', $event)"
    />
    <g-text-field
      :value="executiveName"
      label="代表者名"
      @input="$emit('update:executiveName', $event)"
    />
    <g-text-field
      :value="executiveTitle"
      label="代表者肩書"
      @input="$emit('update:executiveTitle', $event)"
    />
  </div>
</template>

<style></style>
