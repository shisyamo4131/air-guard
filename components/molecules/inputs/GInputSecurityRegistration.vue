<script>
/**
 * 従業員警備員登録情報入力コンポーネント
 * - Employee クラスの securityRegistration プロパティを編集するためのコンポーネントです。
 * @author shisyamo4131
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import Employee from '~/models/Employee'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GNumeric, GCardInputForm, GComboboxDate, GSelect, GTextField },

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
        return instance instanceof Employee
      },
    },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new Employee(),
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    experiencePeriod() {
      const { years, months } =
        this.editModel.securityRegistration.experiencePeriod
      return `${years}年${months}ヶ月`
    },
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="警備員登録情報"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-row dense>
      <v-col cols="12" md="6">
        <g-combobox-date
          v-model="editModel.securityRegistration.registrationDate"
          label="警備員登録日"
          required
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-combobox-date
          v-model="editModel.securityRegistration.securityStartDate"
          label="警備経験開始日"
          required
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-numeric
          v-model="editModel.securityRegistration.blankMonths"
          class="right-input"
          label="ブランク"
          required
          suffix="ヶ月"
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-text-field
          class="center-input"
          :value="experiencePeriod"
          label="経験年数"
          disabled
        ></g-text-field>
      </v-col>
    </v-row>
    <g-text-field
      v-model="editModel.securityRegistration.honseki"
      label="本籍地"
      required
      hint="外国籍の場合は国籍を入力"
    />

    <v-card outlined>
      <v-card-text>
        <v-subheader>緊急連絡先</v-subheader>
        <g-text-field
          v-model="editModel.securityRegistration.emergencyContactName"
          label="氏名"
          required
        />
        <g-select
          v-model="editModel.securityRegistration.emergencyContactRelation"
          label="続柄"
          :items="$RELATION_ARRAY"
          required
        />
        <g-text-field
          v-model="
            editModel.securityRegistration.emergencyContactRelationDetail
          "
          label="続柄詳細"
          required
          counter
          maxlength="5"
        />
        <g-text-field
          v-model="editModel.securityRegistration.emergencyContactAddress"
          label="住所"
          required
        />
        <g-text-field
          v-model="editModel.securityRegistration.emergencyContactTel"
          label="電話番号"
          required
          input-type="tel"
        />
      </v-card-text>
    </v-card>
  </g-card-input-form>
</template>

<style></style>
