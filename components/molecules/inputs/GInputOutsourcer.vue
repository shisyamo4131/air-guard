<script>
/**
 * 外注先入力コンポーネント
 * @author shisyamo4131
 */
import GTextField from '../../atoms/inputs/GTextField.vue'
import GCardInputForm from '../cards/GCardInputForm.vue'
import Outsourcer from '~/models/Outsourcer'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GTextarea,
    GCardInputForm,
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
    <g-text-field-zipcode
      v-model="editModel.zipcode"
      @loaded="editModel.address1 = $event.full"
    />
    <g-text-field v-model="editModel.address1" label="住所" required />
    <g-text-field v-model="editModel.address2" label="建物名・階数" />
    <g-text-field v-model="editModel.tel" label="電話番号" input-type="tel" />
    <g-text-field v-model="editModel.fax" label="FAX番号" input-type="tel" />
    <g-textarea v-model="editModel.remarks" label="備考" hide-details />
  </g-card-input-form>
</template>

<style></style>
