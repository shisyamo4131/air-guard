<script>
/**
 * ### GInputEquipment
 * @author shisayamo4131
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import Equipment from '~/models/Equipment'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextField, GTextarea, GCardInputForm },
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
        return instance instanceof Equipment
      },
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new Equipment(),
    }
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="制服・装備品情報編集"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-form ref="form" @submit.prevent>
      <g-text-field v-model="editModel.name" label="名称" required />
      <g-text-field v-model="editModel.code" label="商品コード" />
      <g-text-field v-model="editModel.colorSize" label="色・サイズ" />
      <g-textarea v-model="editModel.remarks" label="備考" hide-details />
    </v-form>
  </g-card-input-form>
</template>

<style></style>
