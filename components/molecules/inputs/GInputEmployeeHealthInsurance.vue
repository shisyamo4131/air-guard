<script>
/**
 * 従業員社会保障情報入力コンポーネント
 * @author shisyamo4131
 */
import GTextField from '../../atoms/inputs/GTextField.vue'
import GCardInputForm from '../cards/GCardInputForm.vue'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import EmployeeSocialSecurity from '~/models/EmployeeSocialSecurity'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GCardInputForm,
    GNumeric,
    GComboboxDate,
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
        return instance instanceof EmployeeSocialSecurity
      },
    },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new EmployeeSocialSecurity(),
      formValid: [false, false, true],
      step: 1,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    backButton() {
      if (this.step === 1) return 'キャンセル'
      return '戻る'
    },

    type() {
      return this.$HEALTH_INSURANCE_TYPE[this.editModel.healthInsuranceType]
    },

    acquisitionDate() {
      if (!this.editModel.healthInsuranceAcquisitionDate) return ''
      return this.$dayjs(this.editModel.healthInsuranceAcquisitionDate).format(
        'YYYY年MM月DD日'
      )
    },

    standardMonthlyAmount() {
      if (!this.editModel.healthInsuranceStandardMonthlyAmount) return ''
      return `${this.editModel.healthInsuranceStandardMonthlyAmount.toLocaleString()} 円/月`
    },

    policyNumber() {
      return this.editModel.healthInsurancePolicyNumber
    },

    nextButton() {
      if (this.step === 3) return '登録'
      return '次へ'
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * ミックスインの initialize メソッドの最後に実行されます。
     * - ステップを初期化します。
     * - 各フォームのバリデーションを初期化します。
     */
    afterInitialize() {
      this.step = 1
      for (let i = 1; i <= 3; i++) {
        const form = this.$refs[`step${i}`]
        if (form) form.resetValidation()
      }
    },

    /**
     * 健康保険種類が変更された時の処理です。
     * - 健康保険以外の場合は資格取得日、標準報酬月額、被保険者整理番号を初期化します。
     */
    healthInsuranceTypeChanged(event) {
      if (event !== 'EMPLOYMENT') {
        this.editModel.healthInsuranceAcquisitionDate = ''
        this.editModel.healthInsuranceStandardMonthlyAmount = null
        this.editModel.healthInsurancePolicyNumber = ''
      }
      this.editModel.healthInsuranceType = event
    },

    /**
     * 前のウィンドウに遷移します。
     * - 健康保険以外が選択されている場合、最初の画面までスキップします。
     */
    back() {
      const type = this.editModel.healthInsuranceType
      if (this.step === 3 && type !== 'EMPLOYMENT') {
        this.step = 1
      } else {
        this.step--
      }
    },

    /**
     * 次のウィンドウに遷移します。
     * - 健康保険以外が選択されている場合は確認画面までスキップします。
     */
    next() {
      const type = this.editModel.healthInsuranceType
      if (this.step === 1 && type !== 'EMPLOYMENT') {
        this.step = 3
      } else {
        this.step++
      }
    },
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="健康保険情報編集"
    :edit-mode="editMode"
    :loading="loading"
    no-padding
    v-on="$listeners"
  >
    <template #default>
      <v-window v-model="step">
        <v-window-item :value="1">
          <v-card-text>
            <v-form ref="step1" v-model="formValid[0]" @submit.prevent>
              <v-radio-group
                :value="editModel.healthInsuranceType"
                class="mt-0"
                :rules="[(v) => v !== 'NONE' || '選択してください。']"
                @change="healthInsuranceTypeChanged"
              >
                <v-radio
                  v-for="item of $HEALTH_INSURANCE_TYPE_ARRAY.slice(1, 4)"
                  :key="item.value"
                  :label="item.text"
                  :value="item.value"
                />
              </v-radio-group>
            </v-form>
          </v-card-text>
        </v-window-item>
        <v-window-item :value="2">
          <v-card-text>
            <v-form ref="step2" v-model="formValid[1]" @submit.prevent>
              <g-combobox-date
                v-model="editModel.healthInsuranceAcquisitionDate"
                label="資格取得日"
                required
              />
              <g-numeric
                v-model="editModel.healthInsuranceStandardMonthlyAmount"
                label="標準報酬月額"
                class="right-input"
                suffix="円/月"
                required
              />
              <g-text-field
                v-model="editModel.healthInsurancePolicyNumber"
                label="被保険者整理番号"
                required
              />
            </v-form>
          </v-card-text>
        </v-window-item>
        <v-window-item :value="3">
          <v-card-subtitle>以下の内容で登録します。</v-card-subtitle>
          <v-card-text>
            <v-simple-table>
              <tbody>
                <tr>
                  <td>健康保険種類</td>
                  <td>{{ type }}</td>
                </tr>
                <tr v-if="editModel.healthInsuranceType === 'EMPLOYMENT'">
                  <td>資格取得日</td>
                  <td>{{ acquisitionDate }}</td>
                </tr>
                <tr v-if="editModel.healthInsuranceType === 'EMPLOYMENT'">
                  <td>標準報酬月額</td>
                  <td>{{ standardMonthlyAmount }}</td>
                </tr>
                <tr v-if="editModel.healthInsuranceType === 'EMPLOYMENT'">
                  <td>被保険者整理番号</td>
                  <td>{{ policyNumber }}</td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card-text>
        </v-window-item>
      </v-window>
    </template>
    <template #actions="{ attrs }">
      <v-card-actions
        :class="step === 1 ? 'justify-end' : 'justify-space-between'"
      >
        <v-btn v-if="step !== 1" @click="back">{{ backButton }}</v-btn>
        <v-btn
          color="primary"
          :disabled="!formValid[step - 1] || attrs.disabled"
          :loading="attrs.loading"
          @click="step === 3 ? submit() : next()"
        >
          {{ nextButton }}
        </v-btn>
      </v-card-actions>
    </template>
  </g-card-input-form>
</template>

<style></style>
