<script>
/**
 * 取引先情報入力コンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.1.0
 * @updates
 * - version 1.1.0 - 2024-10-04 - Use `GCheckboxDeleteData` instead of `GCheckbox`.
 * - version 1.0.0 - 2024-xx-xx - 初版作成
 */
import GTextField from '../../atoms/inputs/GTextField.vue'
import GSelect from '../../atoms/inputs/GSelect.vue'
import GNumeric from '../../atoms/inputs/GNumeric.vue'
import GCardInputForm from '../cards/GCardInputForm.vue'
import ARenderlessZipcode from '~/components/atoms/renderless/ARenderlessZipcode.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import Customer from '~/models/Customer'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import GCheckboxDeleteData from '~/components/atoms/inputs/GCheckboxDeleteData.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    ARenderlessZipcode,
    GTextField,
    GSelect,
    GNumeric,
    GTextarea,
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
        return instance instanceof Customer
      },
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onChangedName1(val) {
      if (!val) return val
      // '株式会社'と'有限会社'を取り除く
      let result = val.replace(/株式会社|有限会社/g, '')
      // 前後の全角・半角スペースを取り除く
      result = result
        .trim()
        .replace(/^\s+|\s+$/g, '')
        .replace(/^[\u3000]+|[\u3000]+$/g, '')
      // this.$emit('update:abbr', result)
      this.editModel.abbr = result
    },
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="取引先情報編集"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-form @submit.prevent>
      <g-text-field
        v-model="editModel.name1"
        label="取引先名1"
        required
        @change="onChangedName1"
      />
      <g-text-field v-model="editModel.name2" label="取引先名2" />
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
      <a-renderless-zipcode
        v-model="editModel.zipcode"
        @loaded="editModel.address1 = $event.full"
      >
        <template #default="{ attrs, on }">
          <g-text-field
            class="center-input"
            style="max-width: 96px"
            v-bind="attrs"
            label="郵便番号"
            v-on="on"
          />
        </template>
      </a-renderless-zipcode>
      <g-text-field v-model="editModel.address1" label="住所" required />
      <g-text-field v-model="editModel.address2" label="建物名・階数" />
      <v-row dense>
        <v-col cols="12" sm="6">
          <g-text-field
            v-model="editModel.tel"
            label="電話番号"
            input-type="tel"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <g-text-field
            v-model="editModel.fax"
            label="FAX番号"
            input-type="tel"
          />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" sm="4">
          <g-select
            v-model="editModel.deadline"
            label="締日"
            :disabled="editMode !== CREATE"
            :items="$DEADLINE_ARRAY"
            required
          />
        </v-col>
        <v-col cols="12" sm="4">
          <g-numeric
            v-model="editModel.depositMonth"
            label="入金月"
            :disabled="editMode !== CREATE"
            suffix="ヶ月後"
            required
          />
        </v-col>
        <v-col cols="12" sm="4">
          <g-select
            v-model="editModel.depositDate"
            label="入金日"
            :disabled="editMode !== CREATE"
            :items="$DEADLINE_ARRAY"
            required
          />
        </v-col>
      </v-row>
      <g-textarea v-model="editModel.remarks" label="備考" hide-details />
    </v-form>
    <g-checkbox-delete-data v-if="editMode !== CREATE" v-model="forceDelete" />
  </g-card-input-form>
</template>

<style></style>
