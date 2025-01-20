<script>
/**
 * 従業員警備員登録情報入力コンポーネント
 * - Employee クラスの securityRegistration プロパティを編集するためのコンポーネントです。
 * @author shisyamo4131
 * @refact 2025-01-20
 */
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import SecurityRegistration from '~/models/SecurityRegistration'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GNumeric, GComboboxDate, GSelect, GTextField },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeReceiver],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    securityRegistration: {
      type: Object,
      default: () => new SecurityRegistration(),
      required: false,
      validator: (instance) => instance instanceof SecurityRegistration,
    },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editItem: new SecurityRegistration(),
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    experiencePeriod() {
      const { years, months } = this.editItem.experiencePeriod
      return `${years}年${months}ヶ月`
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    editItem: {
      handler(v) {
        this.$emit('update:securityRegistration', v)
      },
      deep: true,
    },
    securityRegistration: {
      handler(v) {
        Object.entries(v).forEach(([key, value]) => {
          this.editItem[key] = value
        })
      },
      immediate: true,
    },
  },
}
</script>

<template>
  <div>
    <v-row dense>
      <v-col cols="12" md="6">
        <g-combobox-date
          v-model="editItem.registrationDate"
          label="警備員登録日"
          required
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-combobox-date
          v-model="editItem.securityStartDate"
          label="警備経験開始日"
          required
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-numeric
          v-model="editItem.blankMonths"
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
      v-model="editItem.honseki"
      label="本籍地"
      required
      hint="外国籍の場合は国籍を入力"
    />

    <v-card outlined>
      <v-subheader>緊急連絡先</v-subheader>
      <v-card-text>
        <g-text-field
          v-model="editItem.emergencyContactName"
          label="氏名"
          required
        />
        <g-select
          v-model="editItem.emergencyContactRelation"
          label="続柄"
          :items="$RELATION_ARRAY"
          required
        />
        <g-text-field
          v-model="editItem.emergencyContactRelationDetail"
          label="続柄詳細"
          required
          counter
          maxlength="5"
        />
        <g-text-field
          v-model="editItem.emergencyContactAddress"
          label="住所"
          required
        />
        <g-text-field
          v-model="editItem.emergencyContactTel"
          label="電話番号"
          required
          input-type="tel"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<style></style>
