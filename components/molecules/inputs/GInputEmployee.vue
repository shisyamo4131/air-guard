<script>
/**
 * Employee用Inputコンポーネントです。
 *
 * @author shisyamo4131
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import ARenderlessZipcode from '~/components/atoms/renderless/ARenderlessZipcode.vue'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import Employee from '~/models/Employee'
import GCheckboxDeleteData from '~/components/atoms/inputs/GCheckboxDeleteData.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GTextarea,
    ARenderlessZipcode,
    GSwitch,
    GSelect,
    GComboboxDate,
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
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * `lastName`または`firstName`のchangeイベントで呼び出されます。
     * `lastName`と`firstName`を結合して最初の5文字を生成し、`abbr`にセットします。
     */
    refreshAbbr() {
      const combined = `${this.editModel.lastName}${this.editModel.firstName}`
      const sliced = combined.slice(0, 5)
      this.editModel.abbr = sliced
    },
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="従業員情報編集"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-form @submit.prevent>
      <g-text-field v-model="editModel.code" label="CODE" disabled />
      <v-row dense>
        <v-col cols="12" md="6">
          <g-text-field
            v-model="editModel.lastName"
            label="氏"
            required
            @change="refreshAbbr"
          />
        </v-col>
        <v-col cols="12" md="6">
          <g-text-field
            v-model="editModel.firstName"
            label="名"
            @change="refreshAbbr"
          />
        </v-col>
        <v-col cols="12" md="6">
          <g-text-field
            v-model="editModel.lastNameKana"
            label="氏カナ"
            required
            hint="検索に使用されます"
            ignore-surrogate-pair
            input-type="katakana"
          />
        </v-col>
        <v-col cols="12" md="6">
          <g-text-field
            v-model="editModel.firstNameKana"
            label="名カナ"
            required
            hint="検索に使用されます"
            ignore-surrogate-pair
            input-type="katakana"
          />
        </v-col>
        <v-col cols="12" md="6">
          <g-text-field
            v-model="editModel.abbr"
            label="略称"
            required
            hint="検索に使用されます"
            ignore-surrogate-pair
            counter
            maxlength="5"
          />
        </v-col>
        <v-col cols="12" md="6">
          <g-text-field
            v-model="editModel.abbrKana"
            label="略称カナ"
            required
            hint="検索に使用されます"
            ignore-surrogate-pair
            counter
            maxlength="5"
            input-type="katakana"
          />
        </v-col>
        <v-col cols="12" md="6">
          <g-combobox-date
            v-model="editModel.hireDate"
            label="入社日"
            required
          />
        </v-col>
        <v-col cols="12" md="6">
          <g-combobox-date
            v-model="editModel.birth"
            label="生年月日"
            required
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-radio-group v-model="editModel.gender" class="mt-1 mb-2" row>
            <v-radio label="男性" value="male" />
            <v-radio label="女性" value="female" />
          </v-radio-group>
        </v-col>
        <v-col cols="12" md="6">
          <g-select
            v-model="editModel.bloodType"
            label="血液型"
            :items="['A', 'B', 'O', 'AB', '-']"
            required
          />
        </v-col>
        <v-col cols="12" md="6">
          <g-switch
            v-model="editModel.isForeigner"
            class="mt-1"
            label="外国籍"
          />
        </v-col>
        <v-col cols="12" md="6">
          <g-text-field
            v-model="editModel.nationality"
            label="国籍"
            :required="editModel.isForeigner"
            :disabled="!editModel.isForeigner"
          />
        </v-col>
      </v-row>
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
      <g-text-field
        v-model="editModel.mobile"
        label="携帯番号"
        input-type="tel"
      />
      <g-select
        v-model="editModel.contractType"
        label="雇用形態"
        required
        :items="$EMPLOYEE_CONTRACT_TYPE_ARRAY"
      />
      <g-text-field
        v-model="editModel.designation"
        label="役職"
        required
        counter
        maxlength="5"
      />
      <g-textarea v-model="editModel.remarks" label="備考" hide-details />
    </v-form>
    <g-checkbox-delete-data v-if="editMode !== CREATE" v-model="forceDelete" />
  </g-card-input-form>
</template>

<style></style>
