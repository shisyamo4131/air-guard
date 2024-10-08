<script>
/**
 * OperationResultOutsourcer入力コンポーネント
 *
 * - `OperationResult`モデルが保有する`outsourcers`プロパティ（配列）の1要素を編集するためのコンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-10-02 - 初版作成
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GAutocompleteOutsourcer from '~/components/atoms/inputs/GAutocompleteOutsourcer.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import OperationResultOutsourcer from '~/models/OperationResultOutsourcer'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GTextarea,
    GAutocompleteOutsourcer,
    GCheckbox,
    GNumeric,
    GComboboxDate,
    GCardInputForm,
    GSelect,
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
        return instance instanceof OperationResultOutsourcer
      },
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new OperationResultOutsourcer(),
      submitType: 'toParent',
    }
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="稼働実績明細編集"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-form @submit.prevent>
      <g-autocomplete-outsourcer
        v-model="editModel.outsourcerId"
        label="外注先"
        required
        disabled
      />
      <v-row dense>
        <v-col cols="6">
          <g-combobox-date v-model="editModel.date" label="勤務日" required />
        </v-col>
        <v-col cols="6">
          <g-select
            v-model="editModel.workResult"
            label="勤務結果"
            required
            :items="['normal', 'half', 'cancel']"
          />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="6" sm="3">
          <g-text-field
            v-model="editModel.startTime"
            class="center-input"
            label="開始時刻"
            input-type="time"
            required
          />
        </v-col>
        <v-col cols="6" sm="3">
          <g-text-field
            v-model="editModel.endTime"
            class="center-input"
            label="終了時刻"
            input-type="time"
            required
          />
        </v-col>
        <v-col cols="12" sm="6">
          <g-checkbox
            v-model="editModel.endAtNextday"
            class="mt-1"
            label="翌日終了"
          />
        </v-col>
        <v-col cols="6" sm="3">
          <g-numeric
            v-model="editModel.breakMinutes"
            class="center-input"
            label="休憩時間"
            required
          />
        </v-col>
        <v-col cols="6" sm="3">
          <g-numeric
            v-model="editModel.workMinutes"
            class="center-input"
            label="実働時間"
            required
          />
        </v-col>
        <v-col cols="6" sm="3">
          <g-numeric
            v-model="editModel.overtimeMinutes"
            class="center-input"
            label="残業時間"
            required
            disabled
          />
        </v-col>
        <v-col cols="6" sm="3">
          <g-numeric
            v-model="editModel.nighttimeMinutes"
            class="center-input"
            label="深夜時間"
            required
            disabled
          />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" sm="6">
          <g-checkbox
            v-model="editModel.qualification"
            class="mt-1"
            label="資格者"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <g-checkbox v-model="editModel.ojt" class="mt-1" label="OJT" />
        </v-col>
      </v-row>
      <g-textarea v-model="editModel.remarks" label="備考" hide-details />
    </v-form>
  </g-card-input-form>
</template>

<style></style>
