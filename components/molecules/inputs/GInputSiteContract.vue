<script>
/**
 * ### GInputSiteContract
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-23 - FireModelのパッケージ化に伴って再作成
 *                              - unitPricesの更新処理を変更
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import SiteContract from '~/models/SiteContract'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GAutocompleteSite from '~/components/atoms/inputs/GAutocompleteSite.vue'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GTextarea,
    GComboboxDate,
    GNumeric,
    GSwitch,
    GAutocompleteSite,
    GCardInputForm,
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
        return instance instanceof SiteContract
      },
    },
    allowedDates: { type: Function, default: null, required: false },
    hideSite: { type: Boolean, default: false, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new SiteContract(),
      dayDivs: [
        { text: '平日', value: 'weekdays' },
        { text: '土曜', value: 'saturday' },
        { text: '日曜', value: 'sunday' },
        { text: '祝日', value: 'holiday' },
      ],
      nums: [
        { text: '基本単価', value: 'price' },
        { text: '残業単価', value: 'overtime' },
      ],
      qualifies: [
        { text: '通常', value: 'standard' },
        { text: '資格者', value: 'qualified' },
      ],
      workShifts: [
        { text: '日勤', value: 'day' },
        { text: '夜勤', value: 'night' },
      ],
      tab: null,
    }
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    afterInitialize() {
      this.tab = null
    },
    updateUnitPrices(val, path) {
      const keys = path.split('.')
      const obj = JSON.parse(JSON.stringify(this.unitPrices))
      let ref = obj
      keys.slice(0, -1).forEach((key) => {
        ref = ref[key]
      })
      ref[keys[keys.length - 1]] = val
      this.$emit('update:unitPrices', obj)
    },
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="現場取極め情報編集"
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
      <v-row dense>
        <v-col cols="12" md="6">
          <g-combobox-date
            v-model="editModel.startDate"
            :allowed-dates="allowedDates"
            label="開始日"
            required
            :disabled="editMode !== CREATE"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-radio-group
            v-model="editModel.workShift"
            class="mt-1 mb-2"
            row
            :disabled="editMode !== CREATE"
          >
            <v-radio label="日勤" value="day" />
            <v-radio label="夜勤" value="night" />
          </v-radio-group>
        </v-col>
        <v-col cols="6">
          <g-text-field
            v-model="editModel.startTime"
            class="center-input"
            label="開始時刻"
            required
            input-type="time"
          />
        </v-col>
        <v-col cols="6">
          <g-text-field
            v-model="editModel.endTime"
            class="center-input"
            label="終了時刻"
            required
            input-type="time"
          />
        </v-col>
        <v-col cols="6">
          <g-switch
            v-model="editModel.endTimeNextday"
            class="mt-1"
            label="翌日終了"
            required
          />
        </v-col>
        <v-col cols="6">
          <g-numeric
            v-model="editModel.breakMinutes"
            class="center-input"
            label="休憩時間"
            required
            suffix="分"
          />
        </v-col>
      </v-row>
      <v-card class="mb-6" outlined>
        <v-tabs v-model="tab" center-active grow show-arrows>
          <v-tab v-for="dayDiv of dayDivs" :key="dayDiv.value">
            {{ dayDiv.text }}
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item v-for="dayDiv of dayDivs" :key="dayDiv.value" eager>
            <v-card-text>
              <template v-for="qualified of qualifies">
                <v-subheader :key="`header-${qualified.value}`">
                  {{ qualified.text }}
                </v-subheader>
                <v-row :key="`row-${qualified.value}`" dense>
                  <template v-for="num of nums">
                    <v-col
                      :key="`${dayDiv.value}-${qualified.value}-${num.value}`"
                      cols="6"
                    >
                      <g-numeric
                        v-model="
                          editModel.unitPrices[dayDiv.value][qualified.value][
                            num.value
                          ]
                        "
                        class="right-input"
                        :label="`${num.text}`"
                        required
                        suffix="円"
                      />
                    </v-col>
                  </template>
                </v-row>
              </template>
            </v-card-text>
          </v-tab-item>
        </v-tabs-items>
      </v-card>
      <v-row dense>
        <v-col cols="6">
          <g-numeric
            v-model="editModel.halfRate"
            class="right-input"
            label="半勤請求割合"
            required
            suffix="%"
          />
        </v-col>
        <v-col cols="6">
          <g-numeric
            v-model="editModel.cancelRate"
            class="right-input"
            label="中止請求割合"
            required
            suffix="%"
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
