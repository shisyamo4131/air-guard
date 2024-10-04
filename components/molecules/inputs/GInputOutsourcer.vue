<script>
/**
 * ## GInputOutsourcer
 *
 * @author shisyamo4131
 * @version 1.1.0
 * @updates
 * - version 1.1.0 - 2024-10-04 - Use `GCheckboxDeleteData` instead of `GCheckbox`.
 * - version 1.0.0 - 2024-xx-xx - 初版作成
 */
import GTextField from '../../atoms/inputs/GTextField.vue'
import GCardInputForm from '../cards/GCardInputForm.vue'
import ARenderlessZipcode from '~/components/atoms/renderless/ARenderlessZipcode.vue'
import Outsourcer from '~/models/Outsourcer'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import GCheckboxDeleteData from '~/components/atoms/inputs/GCheckboxDeleteData.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    ARenderlessZipcode,
    GTextField,
    GTextarea,
    GCardInputForm,
    GCheckboxDeleteData,
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
        return instance instanceof Outsourcer
      },
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new Outsourcer(),
    }
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="外注先情報編集"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-form @submit.prevent>
      <g-text-field v-model="editModel.name" label="外注先名" required />
      <g-text-field
        v-model="editModel.abbr"
        label="略称"
        required
        hint="検索に使用されます"
        ignore-surrogate-pair
      />
      <g-text-field
        v-model="editModel.abbrKana"
        label="略称カナ"
        required
        hint="検索に使用されます"
        ignore-surrogate-pair
        input-type="katakana"
      />
      <a-renderless-zipcode
        v-model="editModel.zipcode"
        @loaded="editModel.address1 = $event.full"
      >
        <template #default="{ attrs, on }">
          <g-text-field v-bind="attrs" label="郵便番号" v-on="on" />
        </template>
      </a-renderless-zipcode>
      <g-text-field v-model="editModel.address1" label="住所" required />
      <g-text-field v-model="editModel.address2" label="建物名・階数" />
      <g-text-field v-model="editModel.tel" label="電話番号" input-type="tel" />
      <g-text-field v-model="editModel.fax" label="FAX番号" input-type="tel" />
      <g-textarea v-model="editModel.remarks" label="備考" hide-details />
    </v-form>
    <g-checkbox-delete-data v-if="editMode !== CREATE" v-model="forceDelete" />
  </g-card-input-form>
</template>

<style></style>
