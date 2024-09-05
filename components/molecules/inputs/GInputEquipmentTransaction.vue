<script>
/**
 * ### GInputEquipmentTransaction
 * @author shisayamo4131
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import EquipmentTransaction from '~/models/EquipmentTransaction'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextarea, GComboboxDate, GNumeric, GCardInputForm, GSelect },
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
        return instance instanceof EquipmentTransaction
      },
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new EquipmentTransaction(),
    }
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="入庫・出庫情報編集"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-form ref="form" @submit.prevent>
      <g-combobox-date v-model="editModel.date" label="入庫日" />
      <g-select
        v-model="editModel.transactionType"
        label="区分"
        :items="['in', 'out']"
        required
      />
      <g-numeric v-model="editModel.amount" label="数量" required />
      <g-textarea v-model="editModel.remarks" label="備考" hide-details />
    </v-form>
  </g-card-input-form>
</template>

<style></style>
