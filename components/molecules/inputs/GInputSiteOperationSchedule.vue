<script>
/**
 * ## GInputSiteOperationSchedule
 *
 * 現場の稼働予定を入力するためのコンポーネントです。
 *
 * ### 注意事項:
 * - 日付、勤務区分は変更できません。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-09-16 - 初版作成
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import SiteOperationSchedule from '~/models/SiteOperationSchedule'
import GAutocompleteSite from '~/components/atoms/inputs/GAutocompleteSite.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextarea,
    GSwitch,
    GNumeric,
    GTextField,
    GComboboxDate,
    GCardInputForm,
    GAutocompleteSite,
    GCheckbox,
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
        return instance instanceof SiteOperationSchedule
      },
    },
    hideSite: { type: Boolean, default: false, required: false },
  },
  computed: {
    date: {
      get() {
        return this.editMode === this.CREATE
          ? this.editModel.dates
          : this.editModel.date
      },
      set(v) {
        if (this.editMode === this.CREATE) {
          this.editModel.dates = v
        } else {
          this.editModel.date = v
        }
      },
    },
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="現場稼働予定編集"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-form @submit.prevent>
      <g-autocomplete-site
        v-if="!hideSite"
        v-model="editModel.siteId"
        label="現場"
        required
        :disabled="editMode !== CREATE"
      />
      <g-combobox-date
        v-model="date"
        label="日付"
        :multiple="editMode === CREATE"
        required
        :disabled="editMode !== CREATE"
      />
      <div class="d-flex mb-6 flex-wrap" flat>
        <h5 class="align-self-end pr-4" style="color: rgba(0, 0, 0, 0.6)">
          勤務区分
        </h5>
        <v-radio-group
          v-model="editModel.workShift"
          class="mt-0"
          hide-details
          :disabled="editMode !== CREATE"
          row
        >
          <v-radio value="day" label="日勤" />
          <v-radio value="night" label="夜勤" />
        </v-radio-group>
      </div>
      <v-row dense>
        <v-col cols="6">
          <g-text-field
            v-model="editModel.start"
            class="center-input"
            label="開始時刻"
            required
            input-type="time"
          />
        </v-col>
        <v-col cols="6">
          <g-text-field
            v-model="editModel.end"
            class="center-input"
            label="終了時刻"
            required
            input-type="time"
          />
        </v-col>
        <v-col cols="6">
          <g-numeric
            v-model="editModel.requiredWorkers"
            class="right-input"
            label="人数"
            required
            suffix="名"
          />
        </v-col>
        <v-col cols="6">
          <g-switch
            v-model="editModel.qualification"
            class="mt-1"
            label="要資格者"
          />
        </v-col>
      </v-row>
      <g-textarea v-model="editModel.remarks" label="備考" hide-details />
    </v-form>
    <g-checkbox
      v-if="editMode !== CREATE"
      v-model="forceDelete"
      label="このデータを削除する"
    />
  </g-card-input-form>
</template>

<style></style>
