<script>
/**
 * 自社情報入力コンポーネント
 * @author shisyamo4131
 */
import GTextField from '../../atoms/inputs/GTextField.vue'
import GCardInputForm from '../cards/GCardInputForm.vue'
import CompanyInfo from '~/models/CompanyInfo'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import GTextFieldZipcode from '~/components/atoms/inputs/GTextFieldZipcode.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GCardInputForm,
    GTextFieldZipcode,
  },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GInputSubmitMixin],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    instance: {
      type: Object,
      required: true,
      validator(instance) {
        return instance instanceof CompanyInfo
      },
    },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new CompanyInfo(),
    }
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="{ ...$attrs, editMode, loading }"
    label="自社情報編集"
    disable-delete
    @click:submit="submit"
    v-on="$listeners"
  >
    <g-text-field v-model="editModel.name1" label="会社名1" required />
    <g-text-field v-model="editModel.name2" label="会社名2" />
    <g-text-field-zipcode
      v-model="editModel.zipcode"
      @loaded="editModel.address1 = $event.full"
    />
    <g-text-field v-model="editModel.address1" label="住所" required />
    <g-text-field v-model="editModel.address2" label="建物名・階数" />
    <v-row dense>
      <v-col cols="12" sm="6">
        <g-text-field
          v-model="editModel.tel"
          label="電話番号"
          input-type="tel"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <g-text-field
          v-model="editModel.fax"
          label="FAX番号"
          input-type="tel"
        />
      </v-col>
    </v-row>
    <g-text-field v-model="editModel.corporateNumber" label="法人番号" />
    <g-text-field v-model="editModel.executiveName" label="代表者名" />
    <g-text-field v-model="editModel.executiveTitle" label="代表者肩書" />
  </g-card-input-form>
</template>

<style></style>
