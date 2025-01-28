<script>
/**
 * 現場の稼働予定を入力するためのコンポーネントです。
 * @author shisyamo4131
 * @refact 2025-01-28
 */
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
import GAutocompleteSite from '~/components/atoms/inputs/GAutocompleteSite.vue'
import { vueProps } from '~/models/propsDefinition/SiteOperationSchedule'
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
    GAutocompleteSite,
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
    hideDate: { type: Boolean, default: false, required: false },
    hideSite: { type: Boolean, default: false, required: false },
    hideWorkShift: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    computedDate: {
      get() {
        return this.editMode === this.CREATE ? this.dates : this.date
      },
      set(v) {
        if (this.editMode === this.CREATE) {
          this.$emit('update:dates', v)
        } else {
          this.$emit('update:date', v)
        }
      },
    },
  },
}
</script>

<template>
  <div>
    <g-autocomplete-site
      v-if="!hideSite"
      :value="siteId"
      required
      :disabled="editMode !== CREATE"
      @input="$emit('update:siteId', $event)"
    />
    <g-combobox-date
      v-if="!hideDate"
      v-model="computedDate"
      label="日付"
      :multiple="editMode === CREATE"
      required
      :disabled="editMode !== CREATE"
    />
    <div v-if="!hideWorkShift" class="d-flex mb-6 flex-wrap" flat>
      <h5 class="align-self-end pr-4" style="color: rgba(0, 0, 0, 0.6)">
        勤務区分
      </h5>
      <v-radio-group
        :value="workShift"
        class="mt-0"
        hide-details
        :disabled="editMode !== CREATE"
        row
        @change="$emit('update:workShift', $event)"
      >
        <v-radio value="day" label="日勤" />
        <v-radio value="night" label="夜勤" />
      </v-radio-group>
    </div>
    <g-switch
      :input-value="isClosed"
      class="mt-0"
      label="休工"
      @change="$emit('update:isClosed', $event)"
    />
    <v-expand-transition>
      <v-row v-show="!isClosed" dense>
        <v-col cols="6">
          <g-text-field
            :value="startTime"
            class="center-input"
            label="開始時刻"
            :required="!isClosed"
            input-type="time"
            @input="$emit('update:startTime', $event)"
          />
        </v-col>
        <v-col cols="6">
          <g-text-field
            :value="endTime"
            class="center-input"
            label="終了時刻"
            :required="!isClosed"
            input-type="time"
            @input="$emit('update:endTime', $event)"
          />
        </v-col>
        <v-col cols="6">
          <g-numeric
            :value="requiredWorkers"
            class="right-input"
            label="人数"
            :required="!isClosed"
            suffix="名"
            @input="$emit('update:requiredWorkers', $event)"
          />
        </v-col>
        <v-col cols="6">
          <g-switch
            :input-value="qualification"
            class="mt-1"
            label="要資格者"
            @change="$emit('update:qualification', $event)"
          />
        </v-col>
      </v-row>
    </v-expand-transition>
    <g-textarea
      :value="remarks"
      label="備考"
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
